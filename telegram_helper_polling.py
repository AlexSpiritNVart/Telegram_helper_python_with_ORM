# -*- coding: utf-8 -*-
import time

import telebot
from datetime import datetime
from telegram_site_helper_config import MANAGERPASS, DBNAME, MY_TOKEN
import sqlite3
import json
import logging


bot = telebot.TeleBot(MY_TOKEN)
logger = logging.getLogger("telebot_logging")

def read_from_bd(sql_request, arg, db_name=DBNAME):
    with sqlite3.connect(db_name) as conn:
        cursor = conn.cursor()
        cursor.execute(sql_request, arg)
        result = cursor.fetchone()
        logger.info(result)
    return result


def read_from_bd_many(sql_request, arg, db_name=DBNAME):
    with sqlite3.connect(db_name) as conn:
        cursor = conn.cursor()
        cursor.execute(sql_request, arg)
        result = cursor.fetchall()
        logger.info(result)
    return result


def write_to_bd(sql_request, input_dict, db_name=DBNAME):
    with sqlite3.connect(db_name) as conn:
        cursor = conn.cursor()
        cursor.execute(sql_request, input_dict)
        conn.commit()



def write_to_bd_many(sql_request, *args, db_name=DBNAME):
    with sqlite3.connect(db_name) as conn:
        cursor = conn.cursor()
        cursor.executemany(sql_request, args)
        conn.commit()


def show_manager_now_chat(message, db_name=DBNAME):
    with sqlite3.connect(db_name) as conn:
        sql = """SELECT managerNowChat FROM telegramSiteHelperManagers WHERE managerTelegramId=?"""
        cursor = conn.cursor()
        cursor.execute(sql, (message.chat.id,))
        result = cursor.fetchone()[0]
    return result


def show_manager_id(message, db_name=DBNAME):
    with sqlite3.connect(db_name) as conn:
        sql = """SELECT managerId FROM telegramSiteHelperManagers WHERE managerTelegramId=?"""
        cursor = conn.cursor()
        cursor.execute(sql, (message.chat.id,))
        result = cursor.fetchone()[0]
    return result


@bot.message_handler(commands=['start'])
def start(message):
    with sqlite3.connect(DBNAME) as conn:
        cursor = conn.cursor()
        sql = """SELECT managerId, managerNowChat FROM telegramSiteHelperManagers WHERE managerTelegramId=?"""
        cursor.execute(sql, (message.chat.id,))
        result = cursor.fetchone()
    if result:
        bot.send_message(message.chat.id, 'Вы есть в БД, для вывода полного списка команд нажмите /commands ')
    else:
        msg = bot.send_message(message.chat.id, 'Приветствую, Вас нет в БД введите /login и ваш код через пробел')
        bot.register_next_step_handler(msg, check_pass)


@bot.message_handler(commands=['commands'])
def return_commands(message):
    bot.send_message(message.chat.id, "Список команд:"
                                      "\n/offline - статус офлайн (НЕ принимать сообщения от новых клиентов)"
                                      "\n/online - статус онлайн (принимать сообщения от новых клиентов)"
                                      "\n/logout - Удалить себя из системы"
                                      "\n/chat ID - перейти в чат для общения с клиентом(вместо ID - идентификатор "
                                      "чата) "
                                      "\n/history ID - получить историю сообщений чата (вместо ID - идентификатор чата)"
                                      "\n/newname Name - смена имени менеджера в чате"
                                      "\n/main_ON - стать MAIN менеджером"
                                      "\n/main_OFF - перестать быть MAIN менеджером")


@bot.message_handler(commands=['offline'])
def make_offline(message):
    sql = """UPDATE telegramSiteHelperManagers SET managerStatus=? WHERE managerTelegramId=?"""
    write_to_bd(sql, (0, message.chat.id))
    bot.send_message(message.chat.id, "Вы оффлайн и не будете получать сообщения от новых пользователей")


@bot.message_handler(commands=['online'])
def make_online(message):
    sql = """UPDATE telegramSiteHelperManagers SET managerStatus=? WHERE managerTelegramId=?"""
    write_to_bd(sql, (1, message.chat.id))
    bot.send_message(message.chat.id, 'Вы снова онлайн и будете получать сообщения от новых пользователей')


@bot.message_handler(commands=['logout'])
def logout(message):
    sql = """DELETE FROM telegramSiteHelperManagers WHERE managerTelegramId=?"""
    write_to_bd(sql, (message.chat.id, ))
    bot.send_message(message.chat.id, 'Вы вышли из системы')


@bot.message_handler(commands=['newname'])
def change_name(message):
    new_name = message.text[8:]
    print(new_name)
    if not new_name:
        bot.send_message(message.chat.id, "Необходимо ввести хотя бы один символ. Имя не изменено.")
    else:
        sql = """UPDATE telegramSiteHelperManagers SET managerName=?""" \
              """WHERE managerTelegramId=?"""
        write_to_bd(sql, (new_name, message.chat.id))
        bot.send_message(message.chat.id, f"Ваше новое имя в чате: {new_name}")


# @bot.message_handler(commands=['chat'])
def change_chat(message):
    chat_id = message.text[6:]
    sql = """SELECT COUNT(*) FROM telegramSiteHelperChats WHERE chatId = ?"""
    result = read_from_bd(sql, (chat_id,))
    sql = """SELECT managerId FROM telegramSiteHelperManagers WHERE managerTelegramId=?"""
    manager_id = read_from_bd(sql, (message.chat.id,))[0]
    if result[0] > 0:
        sql = """UPDATE telegramSiteHelperManagers SET managerNowChat = ? WHERE managerId = ? """
        write_to_bd(sql, (chat_id,manager_id))

        sql = """UPDATE telegramSiteHelperChats SET chatManager= ? WHERE chatId =?"""
        write_to_bd(sql, (message.chat.id, chat_id))
        bot.send_message(message.chat.id, f'Вы перешли в чат /chat {chat_id}')

        sql = """SELECT chatCustomerName, chatCustomerPhone FROM telegramSiteHelperChats WHERE chatId= ?"""
        result = read_from_bd(sql, (chat_id,))

        if result[0] or result[1]:
            bot.send_message(message.chat.id, f'Клиент: {result["chatCustomerName"]} '
                                              f'{result["chatCustomerPhone"]}'
                                              f' Для вывода полной истории сообщений нажмите /hystory {chat_id} '
                                              f'через пробел')
    else:
        bot.send_message(message.chat.id, f"Чат /chat_{chat_id} не существует")


@bot.message_handler(commands=['history'])
def show_history(message):
    chat_id = message.text[9:]
    sql = """SELECT COUNT(*) AS count FROM telegramSiteHelperChats WHERE chatId=?"""
    result = read_from_bd(sql, (chat_id,))
    history = f"История переписки /chat_{chat_id}\n\n"

    if result[0] > 0:
        sql = """SELECT chatCustomerName, chatCustomerPhone FROM telegramSiteHelperChats WHERE chatId=?"""
        result = read_from_bd(sql, (chat_id,))
        if result[0]:
            chat_customer_name = result[0]
        else:
            chat_customer_name = "Клиент"

        sql = """SELECT telegramSiteHelperMessages.msgTime, telegramSiteHelperMessages.msgText, """ \
              """telegramSiteHelperManagers.managerName FROM telegramSiteHelperMessages LEFT """ \
              """JOIN telegramSiteHelperManagers ON telegramSiteHelperMessages.msgFrom=telegramSiteHelperManagers.managerId """ \
              """WHERE msgChatId=? ORDER BY msgTime"""
        result = read_from_bd_many(sql, (chat_id,))

        for message_line in result:
            msg = '\n'
            time_correct = datetime.utcfromtimestamp(message_line[0]).strftime('%Y-%m-%d %H:%M:%S ')
            msg += time_correct
            if message_line[2]:
                msg += f"Менеджер {message_line[2]}:\n"
            else:
                msg += f" {chat_customer_name}:\n"
            msg_text_history = json.loads(message_line[1])
            if 'text' in msg_text_history:
                msg += f'- {msg_text_history["text"]}'
            elif "photo" in msg_text_history:
                msg += f"- [photo] "
            elif "file" in msg_text_history and "filename" in msg_text_history:
                msg += f"- [file:{msg_text_history['filename']}] "
            history += msg
        bot.send_message(message.chat.id, history)
    else:
        bot.send_message(message.chat.id, f'Чат /chat{chat_id} не существует')


@bot.message_handler(commands=['todays_chats'])
def return_todays_chats(message):
    datetime_now = str(datetime.date(datetime.now()))
    with sqlite3.connect(DBNAME) as conn:
        cursorObj = conn.cursor()
        cursorObj.execute('''SELECT msgChatId,msgTime FROM telegramSiteHelperMessages ''')
        rows = cursorObj.fetchall()
        todays_chats = str({chat_id[0] for chat_id in rows if datetime_now==datetime.utcfromtimestamp((chat_id[1])).strftime('%Y-%m-%d %H:%M:%S')[:10]})[1:-1]
    bot.send_message(message.chat.id, todays_chats)


@bot.message_handler(commands=['return_chat'])
def give_chat_id(message):
    bot.send_message(message.chat.id, message.chat.id)


@bot.message_handler(commands=['main_ON'])
def main_on(message):
    sql = """UPDATE telegramSiteHelperManagers SET mainManager = 1 WHERE managerTelegramId = ?"""
    write_to_bd(sql, (message.chat.id,))
    bot.send_message(message.chat.id, 'данный менеджер выбран как менеджер по умолчанию')


@bot.message_handler(commands=['main_OFF'])
def main_on(message):
    sql = """UPDATE telegramSiteHelperManagers SET mainManager = 0 WHERE managerTelegramId = ?"""
    write_to_bd(sql, (message.chat.id,))
    bot.send_message(message.chat.id, 'данный менеджер больше не является менеджером по умолчанию')


@bot.message_handler(commands=['login'])
def check_pass(message):
    if message.text[7:] == MANAGERPASS:
        sql = """INSERT INTO telegramSiteHelperManagers (managerTelegramId, managerName, managerNowChat, managerStatus, mainManager)""" \
              """VALUES (?,?,?,?,?)"""
        manager_name = f'{message.chat.first_name} {message.chat.last_name}'
        write_to_bd_many(sql, (message.chat.id, manager_name, None, 1, 1))
        bot.send_message(message.chat.id, "Пароль верный. Вы вошли в систему.")
        bot.send_message(message.chat.id, "Ваш статус - /online. Для отключения введите /offline\n"
                                          "Чтобы удалить себя из системы введите /logout")
        bot.send_message(message.chat.id, f"Ваш имя: {manager_name}.Если хотите сменить имя в чате - введите "
                                          "/newname Новое Имя через пробел"
                                          "\n данный менеджер выбран как менеджер по умолчанию, "
                                          "чтобы это изменить нажмите /main_off")
        start(message)
    else:
        bot.send_message(message.chat.id, 'Не верный пароль введите верный')
        bot.register_next_step_handler(message, check_pass)


@bot.message_handler(content_types=['text'])
def handler_text_messages(message):
    print(message)
    if message.text.startswith('/chat_'):
        change_chat(message)
    else:
        sql = """INSERT INTO telegramSiteHelperMessages (msgChatId, msgFrom, msgTime, msgText) """ \
              """VALUES (?, ?, ?, ?)"""
        message_text = {'text': message.text}
        write_to_bd_many(sql, [show_manager_now_chat(message), show_manager_id(message), message.date, json.dumps(message_text)])


@bot.message_handler(content_types=['photo'])
def send_photo(message):
    file_id = message.photo[-1].file_id
    time_correct = datetime.utcfromtimestamp(message.date).strftime('%Y-%m-%d_%H-%M-%S')
    file = {'photo': file_id, 'filename:': f'photo_{time_correct}'}
    sql = """INSERT INTO telegramSiteHelperMessages (msgChatId, msgFrom, msgTime, msgText) """ \
          """VALUES (?, ?, ?, ?)"""
    write_to_bd_many(sql, [show_manager_now_chat(message), show_manager_id(message), message.date, json.dumps(file)])


@bot.message_handler(content_types=['document'])
def send_photo(message):
    file_id = message.document.file_id
    time_correct = datetime.utcfromtimestamp(message.date).strftime('%Y-%m-%d_%H-%M-%S')
    file = {'document': file_id, 'filename:': f'document_{time_correct}'}
    sql = """INSERT INTO telegramSiteHelperMessages (msgChatId, msgFrom, msgTime, msgText) """ \
          """VALUES (?,?,?,?)"""
    write_to_bd_many(sql, [show_manager_now_chat(message), show_manager_id(message), message.date, json.dumps(file)])


@bot.callback_query_handler(func=lambda call: True)
def test_func(call):
    print(call)


if __name__ == '__main__':
    while True:
        logging.basicConfig(level=logging.ERROR, filename='telebot.log')
        try:
            bot.infinity_polling(none_stop=True)
        except Exception as ex:
            logger.error(ex)
            time.sleep(60)
            

# -*- coding: utf-8 -*-

import time
from datetime import datetime
from DB_engine import Messages, Managers, Chats, session, make_base
from sqlalchemy import func, join
from telegram_site_helper_config import MANAGERPASS, MY_TOKEN
import telebot
import json
import logging

bot = telebot.TeleBot(MY_TOKEN)
logger = logging.getLogger("test_bot_logger")


def show_manager_now_chat(message):
    result = session.query(Managers.manager_now_chat).where(Managers.manager_telegram_id == message.chat.id).one_or_none()
    logger.info(result[0])
    return result[0]


def show_manager_id(message):
    result = session.query(Managers.manager_id).where(Managers.manager_telegram_id == message.chat.id).one_or_none()
    logger.info(result)
    return result[0]


@bot.message_handler(commands=['start'])
def start(message):
    result = session.query(Managers.manager_id, Managers.manager_now_chat).where\
        (Managers.manager_telegram_id == message.chat.id).one_or_none()
    logger.info(result)
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
    session.query(Managers).where(Managers.manager_telegram_id == message.chat.id).update({Managers.manager_status:0})
    session.commit()
    logger.info(f'Менеджер {message.chat.id} offline')
    bot.send_message(message.chat.id, "Вы оффлайн и не будете получать сообщения от новых пользователей")


@bot.message_handler(commands=['online'])
def make_offline(message):
    session.query(Managers).where(Managers.manager_telegram_id == message.chat.id).update({Managers.manager_status:1})
    session.commit()
    logger.info(f'Менеджер {message.chat.id} online')
    bot.send_message(message.chat.id, 'Вы снова онлайн и будете получать сообщения от новых пользователей')


@bot.message_handler(commands=['logout'])
def logout(message):
    session.query(Managers).where(Managers.manager_telegram_id == message.chat.id).delete()
    session.commit()
    logger.info(f'Чат {message.chat.id} удален')
    bot.send_message(message.chat.id, 'Вы вышли из системы')


@bot.message_handler(commands=['newname'])
def change_name(message):
    new_name = message.text[8:]
    logger.info(new_name)
    if not new_name:
        bot.send_message(message.chat.id, "Необходимо ввести хотя бы один символ. Имя не изменено.")
    else:
        session.query(Managers).where(Managers.manager_telegram_id == message.chat.id).update({Managers.manager_name:new_name})
        session.commit()
        bot.send_message(message.chat.id, f"Ваше новое имя в чате: {new_name}")


def change_chat(message):
    new_chat_id = message.text[6:]
    result = session.query(Chats).where(Chats.chat_id==new_chat_id).count()
    logger.info(result)
    manager_id = session.query(Managers.manager_id).where(Managers.manager_telegram_id == message.chat.id).one()
    print(manager_id[0])

    logger.info(manager_id)
    if result > 0:

        session.query(Managers).where(Managers.manager_id == manager_id[0]).update({Managers.manager_now_chat:new_chat_id})
        session.query(Chats).where(Chats.chat_id==new_chat_id).update({Chats.chat_manager:message.chat.id})
        session.commit()
        bot.send_message(message.chat.id, f'Вы перешли в чат /chat {new_chat_id}')

        name_and_phone = session.query(Chats.chat_costumer_name, Chats.chat_costumer_phone).where(Chats.chat_id==new_chat_id).one_or_none()

        if name_and_phone[0] or name_and_phone[1]:
            bot.send_message(message.chat.id, f'Клиент: {result["chatCustomerName"]} '
                                              f'{result["chatCustomerPhone"]}'
                                              f' Для вывода полной истории сообщений нажмите /hystory {new_chat_id} '
                                              f'через пробел')
    else:
        bot.send_message(message.chat.id, f"Чат /chat_{new_chat_id} не существует")


@bot.message_handler(commands=['history'])
def show_history(message):
    chat_id = message.text[9:]
    result = session.query(func.count()).select_from(Chats).where(Chats.chat_id == chat_id).one_or_none()
    history = f"История переписки /chat_{chat_id}\n\n"

    if result[0] > 0:
        result = session.query(Chats.chat_costumer_name, Chats.chat_costumer_phone).where(Chats.chat_id==chat_id)
        if result[0][0]:
            chat_customer_name = result[0]
        else:
            chat_customer_name = "Клиент"

        result = session.query(Messages.message_time, Messages.message_text,
                               Managers.manager_name).select_from(
            join(Messages, Managers, Messages.message_from == Managers.manager_id, isouter=True)
            ).where(Messages.message_chat_id == chat_id).order_by(Messages.message_time)

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
    rows = session.query(Messages.message_id, Messages.message_time).one_or_none()
    todays_chats = str({chat_id[0] for chat_id in rows if datetime_now ==
                        datetime.utcfromtimestamp((chat_id[1])).strftime('%Y-%m-%d %H:%M:%S')[:10]})[1:-1]
    bot.send_message(message.chat.id, todays_chats)


@bot.message_handler(commands=['return_chat_id'])
def give_chat_id(message):
    bot.send_message(message.chat.id, message.chat.id)


@bot.message_handler(commands=['main_ON'])
def main_on(message):
    session.query(Managers).where(Managers.manager_telegram_id == message.chat.id).update({Managers.main_manager:1})
    session.commit()
    bot.send_message(message.chat.id, 'данный менеджер выбран как менеджер по умолчанию')


@bot.message_handler(commands=['main_OFF'])
def main_on(message):
    session.query(Managers).where(Managers.manager_telegram_id == message.chat.id).update({Managers.main_manager:0})
    session.commit()
    bot.send_message(message.chat.id, 'данный менеджер больше не является менеджером по умолчанию')


@bot.message_handler(commands=['login'])
def check_pass(message):
    if message.text[7:] == MANAGERPASS:
        manager_name = f'{message.chat.first_name} {message.chat.last_name}'
        new_manager = Managers(manager_telegram_id=message.chat.id,
                               manager_name=manager_name,
                               manager_now_chat=None,
                               manager_status=1,
                               main_manager=1)
        session.add(new_manager)
        session.commit()
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
    if message.text.startswith('/chat_'):
        change_chat(message)
    else:
        message_text_from_api = {'text': message.text}
        new_message = Messages(message_chat_id=show_manager_now_chat(message),
                               message_from=show_manager_id(message),
                               message_time=message.date,
                               message_text=json.dumps(message_text_from_api))
        session.add(new_message)
        session.commit()


@bot.message_handler(content_types=['photo'])
def send_photo(message):
    file_id = message.photo[-1].file_id
    time_correct = datetime.utcfromtimestamp(message.date).strftime('%Y-%m-%d_%H-%M-%S')
    file = {'photo': file_id, 'filename:': f'photo_{time_correct}'}
    new_message = Messages(message_chat_id=show_manager_now_chat(message),
                           message_from=show_manager_id(message),
                           message_time=message.date,
                           message_text=json.dumps(file))
    session.add(new_message)
    session.commit()


@bot.message_handler(content_types=['document'])
def send_photo(message):
    file_id = message.document.file_id
    time_correct = datetime.utcfromtimestamp(message.date).strftime('%Y-%m-%d_%H-%M-%S')
    file = {'document': file_id, 'filename:': f'document_{time_correct}'}
    new_message = Messages(message_chat_id=show_manager_now_chat(message),
                           message_from=show_manager_id(message),
                           message_time=message.date,
                           message_text=json.dumps(file))
    session.add(new_message)
    session.commit()


if __name__ == '__main__':
    while True:
        make_base()
        logging.basicConfig(level=logging.ERROR, filename='telebot.log')
        try:
            bot.infinity_polling(none_stop=True)
        except Exception as ex:
            logger.error(ex)
            time.sleep(60)

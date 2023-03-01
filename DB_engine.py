from sqlalchemy import create_engine, Column, Integer, Text

from sqlalchemy.orm import sessionmaker, registry
from  telegram_site_helper_config import DBNAME


engine = create_engine(f"sqlite:///{DBNAME}")

Session = sessionmaker(engine)
session = Session()

mapper_registry = registry()

Base = mapper_registry.generate_base()


class Chats(Base):
    __tablename__ = "telegramSiteHelperChats"
    table_id = Column(Integer, nullable=False, primary_key=True)
    chat_id = Column("chatId", Text, nullable=False)
    chat_manager = Column("chatManager", Integer, nullable=True)
    chat_costumer_name = Column("chatCustomerName", Text, nullable=True)
    chat_costumer_phone = Column("chatCustomerPhone", Text, nullable=True)

    def __repr__(self):
        return f'{self.chat_id},{self.manager},{self.costumer_name},{self.costumer_phone}'


class Managers(Base):

    __tablename__ = 'telegramSiteHelperManagers'
    manager_id = Column("managerId",Integer, nullable=False, primary_key=True)
    manager_telegram_id = Column("managerTelegramId", Text, nullable=True)
    manager_name = Column("managerName", Text, nullable=True)
    manager_now_chat = Column("managerNowChat", Text, nullable=True)
    manager_status = Column("managerStatus", Integer, nullable=True)
    main_manager = Column("mainManager", Integer, nullable=True)

    def __repr__(self):
        return f'{self.manager_telegram_id},{self.manager_name},{self.manager_now_chat},' \
               f'{self.manager_status},{self.main_manager}'


class Messages(Base):

    __tablename__ = 'telegramSiteHelperMessages'

    message_id = Column('msgId', Integer, primary_key=True)
    message_chat_id = Column("msgChatId", Text, nullable=True)
    message_from = Column("msgFrom", Text, nullable=True)
    message_time = Column("msgTime", Integer, nullable=True)
    message_text = Column("msgText", Text, nullable=True)
    message_file = Column("msgFile", Text, nullable=True)

    def __repr__(self):
        return f'{self.message_chat_id},{self.message_from},{self.message_time}, {self.message_text},{self.message_file}'


def make_base():
    Base.metadata.create_all(engine)

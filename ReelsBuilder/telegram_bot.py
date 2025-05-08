"""
Telegram Bot module for ReelsBuilder.
Provides notification and interaction capabilities through Telegram.
"""

import os
import logging
from django.conf import settings
from telegram import Update, Bot
from telegram.ext import Updater, CommandHandler, CallbackContext, MessageHandler, Filters

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Get token from environment or settings
TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')

# Initialize bot if token is available
bot = None
if TOKEN:
    bot = Bot(token=TOKEN)

def send_message(chat_id, message):
    """
    Send a message to a specific chat ID.
    
    Args:
        chat_id: Telegram chat ID
        message: Message text to send
    
    Returns:
        True if message was sent, False otherwise
    """
    if not bot:
        logger.warning("Telegram bot not initialized. Missing TELEGRAM_BOT_TOKEN.")
        return False
    
    try:
        bot.send_message(chat_id=chat_id, text=message)
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {e}")
        return False

def notify_user(user, message):
    """
    Send notification to a user if they have a Telegram chat ID.
    
    Args:
        user: Django User model instance
        message: Message text to send
    
    Returns:
        True if message was sent, False otherwise
    """
    try:
        # Assuming TelegramProfile model exists or user model has telegram_chat_id field
        from User.models import UserInfo
        
        # Try to get Telegram chat ID from user
        telegram_chat_id = getattr(user, 'telegram_chat_id', None)
        
        # If not available directly on user, try to get from profile
        if not telegram_chat_id:
            user_info = UserInfo.objects.filter(user=user).first()
            if user_info:
                telegram_chat_id = getattr(user_info, 'telegram_chat_id', None)
        
        if telegram_chat_id:
            return send_message(telegram_chat_id, message)
        else:
            logger.warning(f"No Telegram chat ID found for user {user.username}")
            return False
    except Exception as e:
        logger.error(f"Error in notify_user: {e}")
        return False

# Bot command handlers
def start(update: Update, context: CallbackContext):
    """Send a message when the command /start is issued."""
    user = update.effective_user
    chat_id = update.effective_chat.id
    
    update.message.reply_text(
        f"Hi {user.first_name}! Your chat ID is {chat_id}. "
        f"Use this ID to connect your ReelsBuilder account with Telegram."
    )

def help_command(update: Update, context: CallbackContext):
    """Send a message when the command /help is issued."""
    update.message.reply_text(
        "ReelsBuilder Bot Commands:\n"
        "/start - Get your chat ID\n"
        "/help - Show this help message\n"
    )

def run_bot():
    """
    Run the Telegram bot (for development/testing).
    In production, this would typically be run as a separate process.
    """
    if not TOKEN:
        logger.warning("Cannot run bot. Missing TELEGRAM_BOT_TOKEN.")
        return
    
    updater = Updater(TOKEN)
    dispatcher = updater.dispatcher
    
    # Register handlers
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("help", help_command))
    
    # Start the Bot
    updater.start_polling()
    logger.info("Bot started.")
    
    # Run the bot until you press Ctrl-C
    updater.idle()

# Only run the bot directly if this module is executed directly
if __name__ == "__main__":
    run_bot() 
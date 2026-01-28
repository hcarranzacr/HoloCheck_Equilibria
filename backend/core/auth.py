"""
Authentication utilities - DEPRECATED
Use dependencies/auth.py instead for all authentication needs.
This file is kept for backward compatibility but should not be used.
"""
import logging

logger = logging.getLogger(__name__)

# All authentication logic has been moved to dependencies/auth.py
# This file is deprecated and should not be imported

logger.warning("core/auth.py is deprecated. Use dependencies/auth.py instead.")
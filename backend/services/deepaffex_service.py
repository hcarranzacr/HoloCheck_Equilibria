"""
DeepAffex Token Service
Generates authentication tokens for DeepAffex SDK
"""
import os
import logging
import httpx
from typing import Dict, Any

logger = logging.getLogger(__name__)


class DeepAffexService:
    """Service for managing DeepAffex authentication tokens"""
    
    def __init__(self):
        self.license_key = os.environ.get("DEEPAFFEX_LICENSE_KEY")
        self.study_id = os.environ.get("DEEPAFFEX_STUDY_ID")
        self.api_url = os.environ.get("DEEPAFFEX_API_URL", "api.na-east.deepaffex.ai")
        
        if not self.license_key or not self.study_id:
            logger.error("Missing DeepAffex credentials in environment variables")
            raise ValueError("DeepAffex credentials not configured")
    
    async def get_study_id(self) -> Dict[str, Any]:
        """
        Get study ID for DeepAffex SDK initialization
        
        Returns:
            dict: Study ID response
        """
        try:
            return {
                "status": "200",
                "studyId": self.study_id
            }
        except Exception as e:
            logger.error(f"Error getting study ID: {e}")
            return {
                "status": "500",
                "error": str(e)
            }
    
    async def generate_token(self) -> Dict[str, Any]:
        """
        Generate authentication token for DeepAffex SDK
        
        Returns:
            dict: Token response with token and refreshToken
        """
        try:
            # DeepAffex token generation endpoint
            token_url = f"https://{self.api_url}/api/v2/auth/token"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    token_url,
                    json={
                        "licenseKey": self.license_key,
                        "studyId": self.study_id
                    },
                    headers={
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info("Successfully generated DeepAffex token")
                    
                    return {
                        "status": "200",
                        "token": data.get("token"),
                        "refreshToken": data.get("refreshToken")
                    }
                else:
                    logger.error(f"Failed to generate token: {response.status_code} - {response.text}")
                    return {
                        "status": str(response.status_code),
                        "error": f"Token generation failed: {response.text}"
                    }
                    
        except httpx.TimeoutException:
            logger.error("Timeout while generating DeepAffex token")
            return {
                "status": "500",
                "error": "Token generation timeout"
            }
        except Exception as e:
            logger.error(f"Error generating token: {e}")
            return {
                "status": "500",
                "error": str(e)
            }
from typing import List
from app.db.firebase import get_firebase_db
from loguru import logger

class WatchlistService:
    def __init__(self):
        self.db = get_firebase_db()

    async def get_watchlist(self, user_id: str) -> List[str]:
        if self.db is None:
            return []
        try:
            doc_ref = self.db.collection("watchlists").document(user_id)
            doc = doc_ref.get()
            if doc.exists:
                return doc.to_dict().get("symbols", [])
            return []
        except Exception as e:
            logger.error(f"Error fetching watchlist: {e}")
            return []

    async def add_to_watchlist(self, user_id: str, symbol: str) -> bool:
        if self.db is None:
            return False
        try:
            doc_ref = self.db.collection("watchlists").document(user_id)
            doc = doc_ref.get()
            symbol = symbol.upper()
            
            if doc.exists:
                symbols = doc.to_dict().get("symbols", [])
                if symbol not in symbols:
                    symbols.append(symbol)
                    doc_ref.update({"symbols": symbols})
            else:
                doc_ref.set({"symbols": [symbol]})
            return True
        except Exception as e:
            logger.error(f"Error adding to watchlist: {e}")
            return False

    async def remove_from_watchlist(self, user_id: str, symbol: str) -> bool:
        if self.db is None:
            return False
        try:
            doc_ref = self.db.collection("watchlists").document(user_id)
            doc = doc_ref.get()
            symbol = symbol.upper()
            
            if doc.exists:
                symbols = doc.to_dict().get("symbols", [])
                if symbol in symbols:
                    symbols.remove(symbol)
                    doc_ref.update({"symbols": symbols})
            return True
        except Exception as e:
            logger.error(f"Error removing from watchlist: {e}")
            return False

watchlist_service = WatchlistService()

from fastapi import APIRouter
from app.api.v1.endpoints import predictions, historical, watchlist, sentiment, chatbot

router = APIRouter()

router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
router.include_router(historical.router, prefix="/historical", tags=["historical"])
router.include_router(watchlist.router, prefix="/watchlist", tags=["watchlist"])
router.include_router(sentiment.router, prefix="/sentiment", tags=["sentiment"])
router.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])


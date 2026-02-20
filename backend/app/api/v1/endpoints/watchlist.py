from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.api import deps
from app.services.watchlist import watchlist_service

router = APIRouter()

@router.get("/", response_model=List[str])
async def get_user_watchlist(
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """
    Get current user's watchlist from Firestore.
    """
    user_id = current_user["uid"]
    return await watchlist_service.get_watchlist(user_id)

@router.post("/add/{symbol}")
async def add_symbol(
    symbol: str,
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """
    Add a symbol to user's watchlist.
    """
    user_id = current_user["uid"]
    success = await watchlist_service.add_to_watchlist(user_id, symbol)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update watchlist")
    return {"message": f"{symbol} added to watchlist"}

@router.delete("/remove/{symbol}")
async def remove_symbol(
    symbol: str,
    current_user: dict = Depends(deps.get_current_user)
) -> Any:
    """
    Remove a symbol from user's watchlist.
    """
    user_id = current_user["uid"]
    success = await watchlist_service.remove_from_watchlist(user_id, symbol)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update watchlist")
    return {"message": f"{symbol} removed from watchlist"}

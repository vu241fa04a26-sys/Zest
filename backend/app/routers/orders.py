from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.websocket import manager
from app.routers.auth import get_current_user
from app import models, schemas

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("/", response_model=schemas.OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Order must contain at least one item")

    if not order_in.transaction_id or not order_in.transaction_id.strip():
        raise HTTPException(status_code=400, detail="Payment verification reference is required")
        
    total_amount = 0.0
    order_items_to_create = []
    
    for item in order_in.items:
        db_item = db.query(models.MenuItem).filter(models.MenuItem.id == item.menu_item_id).first()
        if not db_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item.menu_item_id} not found")
        if not db_item.is_available or db_item.availability_status == "Out Of Stock":
            raise HTTPException(status_code=400, detail=f"Item '{db_item.name}' is currently out of stock")
        if item.quantity <= 0:
            raise HTTPException(status_code=400, detail="Item quantity must be at least 1")
            
        item_price = db_item.price
        total_amount += item_price * item.quantity
        
        order_items_to_create.append(
            models.OrderItem(
                menu_item_id=item.menu_item_id,
                quantity=item.quantity,
                item_price=item_price
            )
        )
        
    new_order = models.Order(
        user_id=current_user.id,
        order_status="Pending",
        total_amount=total_amount,
        payment_method=order_in.payment_method,
        transaction_id=order_in.transaction_id
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # Associate items
    for order_item in order_items_to_create:
        order_item.order_id = new_order.id
        db.add(order_item)
        
    db.commit()
    db.refresh(new_order)
    
    # Send WebSocket broadcast to admin notifying them about a new order
    order_dict = {
        "id": new_order.id,
        "user_id": new_order.user_id,
        "user_name": current_user.full_name,
        "order_status": new_order.order_status,
        "total_amount": new_order.total_amount,
        "created_at": new_order.created_at.isoformat() if new_order.created_at else None,
        "items": [
            {
                "name": item.menu_item.name,
                "quantity": item.quantity,
                "price": item.item_price
            } for item in new_order.items
        ]
    }
    await manager.send_personal_message(
        {"event": "new_order", "data": order_dict}, 
        client_id="admin"
    )
    
    return new_order

@router.get("/", response_model=List[schemas.OrderOut])
def get_order_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    orders = db.query(models.Order)\
        .filter(models.Order.user_id == current_user.id)\
        .order_by(models.Order.created_at.desc())\
        .all()
    return orders

@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Check if order belongs to user OR if the user is an admin
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    return order

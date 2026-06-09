from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import func
from typing import List
from datetime import date
from app.core.database import get_db
from app.core.websocket import manager
from app.routers.auth import get_current_admin
from app import models, schemas

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])

@router.get("/analytics", response_model=schemas.AnalyticsOverview)
def get_analytics(db: Session = Depends(get_db)):
    today = date.today()
    
    # Total count of orders today
    today_orders = db.query(models.Order).filter(
        func.date(models.Order.created_at) == today
    ).count()
    
    # Active orders (Pending, Accepted, Preparing, Ready)
    active_orders = db.query(models.Order).filter(
        models.Order.order_status.in_(["Pending", "Accepted", "Preparing", "Ready"])
    ).count()
    
    # Completed orders today
    completed_orders = db.query(models.Order).filter(
        models.Order.order_status == "Completed",
        func.date(models.Order.created_at) == today
    ).count()
    
    # Total revenue today (Completed only)
    today_revenue_res = db.query(func.sum(models.Order.total_amount)).filter(
        models.Order.order_status == "Completed",
        func.date(models.Order.created_at) == today
    ).scalar()
    
    today_revenue = float(today_revenue_res) if today_revenue_res is not None else 0.0
    
    return {
        "today_orders": today_orders,
        "active_orders": active_orders,
        "completed_orders": completed_orders,
        "today_revenue": today_revenue
    }

@router.get("/orders", response_model=List[schemas.OrderOut])
def get_all_orders(db: Session = Depends(get_db)):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.user),
            joinedload(models.Order.items).joinedload(models.OrderItem.menu_item),
        )
        .order_by(models.Order.created_at.desc())
        .all()
    )

@router.put("/orders/{order_id}/status", response_model=schemas.OrderOut)
async def update_order_status(
    order_id: int,
    status_update: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    valid_statuses = ["Pending", "Accepted", "Preparing", "Ready", "Completed", "Rejected"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid order status")
        
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.order_status = status_update.status
    db.commit()
    db.refresh(order)
    
    # WebSocket triggers
    # 1. Inform the user placing the order
    await manager.send_personal_message(
        {
            "event": "order_update",
            "data": {
                "order_id": order.id,
                "status": order.order_status
            }
        },
        client_id=str(order.user_id)
    )
    # 2. Inform the admin panel sessions
    await manager.send_personal_message(
        {
            "event": "admin_order_update",
            "data": {
                "order_id": order.id,
                "status": order.order_status
            }
        },
        client_id="admin"
    )
    
    return order

# Menu Management CRUD
@router.post("/menu-items", response_model=schemas.MenuItemOut, status_code=status.HTTP_201_CREATED)
def create_menu_item(item_in: schemas.MenuItemCreate, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == item_in.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    new_item = models.MenuItem(
        category_id=item_in.category_id,
        name=item_in.name,
        description=item_in.description,
        image=item_in.image,
        price=item_in.price,
        is_veg=item_in.is_veg,
        is_available=item_in.is_available,
        availability_status=item_in.availability_status
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/menu-items/{item_id}", response_model=schemas.MenuItemOut)
def update_menu_item(item_id: int, item_in: schemas.MenuItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    for field, value in item_in.model_dump(exclude_unset=True).items():
        if field == "category_id" and value is not None:
            category = db.query(models.Category).filter(models.Category.id == value).first()
            if not category:
                raise HTTPException(status_code=404, detail="Category not found")
        setattr(item, field, value)
        
    db.commit()
    db.refresh(item)
    return item

@router.delete("/menu-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
        
    db.delete(item)
    db.commit()
    return None

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app import models, schemas

router = APIRouter(prefix="/menu", tags=["menu"])

@router.get("/categories", response_model=List[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.get("/items", response_model=List[schemas.MenuItemOut])
def get_menu_items(
    category_id: Optional[int] = None,
    is_veg: Optional[bool] = None,
    is_available: Optional[bool] = None,
    meal_tag: Optional[str] = None,  # "breakfast", "lunch", "dinner"
    search: Optional[str] = None,
    sort_by: Optional[str] = None,  # "price_asc", "price_desc"
    db: Session = Depends(get_db)
):
    query = db.query(models.MenuItem)
    
    if category_id is not None:
        query = query.filter(models.MenuItem.category_id == category_id)
        
    if is_veg is not None:
        query = query.filter(models.MenuItem.is_veg == is_veg)
        
    if is_available is not None:
        query = query.filter(models.MenuItem.is_available == is_available)
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.MenuItem.name.ilike(search_filter)) | 
            (models.MenuItem.description.ilike(search_filter))
        )
        
    # Match tags dynamically based on category names
    if meal_tag:
        meal_tag = meal_tag.lower()
        query = query.join(models.Category)
        if meal_tag == "breakfast":
            query = query.filter(
                (models.Category.name.ilike("%breakfast%")) |
                (models.MenuItem.description.ilike("%breakfast%")) |
                (models.MenuItem.name.ilike("%breakfast%")) |
                (models.Category.name.ilike("%juice%")) |
                (models.Category.name.ilike("%milkshake%")) |
                (models.Category.name.ilike("%mocktail%"))
            )
        elif meal_tag == "lunch":
            query = query.filter(
                (models.Category.name.ilike("%rice%")) |
                (models.Category.name.ilike("%biryani%")) |
                (models.Category.name.ilike("%noodle%")) |
                (models.MenuItem.description.ilike("%lunch%"))
            )
        elif meal_tag == "dinner":
            query = query.filter(
                (models.Category.name.ilike("%burger%")) |
                (models.Category.name.ilike("%pizza%")) |
                (models.Category.name.ilike("%sandwich%")) |
                (models.Category.name.ilike("%shawarma%")) |
                (models.Category.name.ilike("%starter%")) |
                (models.Category.name.ilike("%rice%")) |
                (models.Category.name.ilike("%biryani%")) |
                (models.Category.name.ilike("%noodle%"))
            )

    if sort_by == "price_asc":
        query = query.order_by(models.MenuItem.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(models.MenuItem.price.desc())
    else:
        query = query.order_by(models.MenuItem.id.asc())
        
    return query.all()

@router.get("/items/{item_id}", response_model=schemas.MenuItemOut)
def get_menu_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.MenuItem).filter(models.MenuItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return item

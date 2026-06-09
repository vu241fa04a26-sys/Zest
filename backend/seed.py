from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app import models

def seed_db():
    print("Dropping all existing database tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating all database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Seed Admin
        admin = models.AdminUser(
            email="admin@zest.com",
            password_hash=get_password_hash("ZestAdmin2026!")
        )
        db.add(admin)
        print("Admin user created: admin@zest.com / ZestAdmin2026!")

        # 2. Seed Categories
        categories = {
            "Breakfast": models.Category(name="Breakfast", image="breakfast"),
            "Rice": models.Category(name="Rice", image="rice"),
            "Noodles": models.Category(name="Noodles", image="noodles"),
            "Biryani": models.Category(name="Biryani", image="biryani"),
            "Burgers": models.Category(name="Burgers", image="burgers"),
            "Pizza": models.Category(name="Pizza", image="pizza"),
            "Sandwiches": models.Category(name="Sandwiches", image="sandwiches"),
            "Shawarma": models.Category(name="Shawarma", image="shawarma"),
            "Starters": models.Category(name="Starters", image="starters"),
            "Juices": models.Category(name="Juices", image="juices"),
            "Milkshakes": models.Category(name="Milkshakes", image="milkshakes"),
            "Mocktails": models.Category(name="Mocktails", image="mocktails")
        }
        
        for cat in categories.values():
            db.add(cat)
        db.commit()  # Commit to get category IDs
        print("Categories seeded.")

        # Default image URLs for categories/items
        img_dosa = "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=60"
        img_idly = "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60"
        img_chapati = "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60"
        img_rice = "https://images.unsplash.com/photo-1603133872878-685f588c7a9a?w=500&auto=format&fit=crop&q=60"
        img_noodle = "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60"
        img_biryani = "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60"
        img_burger = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60"
        img_pizza = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60"
        img_sandwich = "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=500&auto=format&fit=crop&q=60"
        img_shawarma = "https://images.unsplash.com/photo-1642683215891-37835150efb0?w=500&auto=format&fit=crop&q=60"
        img_starter = "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=60"
        img_juice = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60"
        img_shake = "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=500&auto=format&fit=crop&q=60"
        img_mocktail = "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=60"

        # List of items to seed
        menu_items = []

        # Category: Breakfast
        breakfast_items = [
            ("Plain Dosa", "Thin, crispy crepe made from fermented rice and lentil batter.", 30.0, True, img_dosa),
            ("Karam Dosa", "Crispy dosa spread with spicy red garlic chutney.", 40.0, True, img_dosa),
            ("Onion Dosa", "Delicious crispy dosa topped with finely chopped onions.", 40.0, True, img_dosa),
            ("Upma Dosa", "Savory dosa stuffed with hot semolina upma.", 50.0, True, img_dosa),
            ("Ghee Karam Dosa", "Crispy dosa cooked with rich ghee and spread with red chili chutney.", 50.0, True, img_dosa),
            ("Masala Dosa", "Crispy dosa stuffed with spiced potato mash, served with chutney.", 50.0, True, img_dosa),
            ("Cheese Masala Dosa", "Loaded with melted cheese and seasoned potato filling.", 60.0, True, img_dosa),
            ("Butter Dosa", "Crispy golden dosa roasted with a generous dollop of butter.", 50.0, True, img_dosa),
            ("Paneer Dosa", "Stuffed with seasoned crumbled paneer (cottage cheese).", 80.0, True, img_dosa),
            ("Egg Dosa", "Crispy dosa layered with a spread egg, seasoned with pepper.", 50.0, False, img_dosa),
            ("Double Egg Dosa", "Crispy dosa layered with two spread eggs for extra rich flavor.", 60.0, False, img_dosa),
            ("Carrot Dosa", "Healthy dosa topped with grated sweet carrots.", 40.0, True, img_dosa),
            ("Carrot Masala Dosa", "Crispy dosa stuffed with carrot and spiced potato filling.", 50.0, True, img_dosa),
            ("Beetroot Dosa", "Vibrant, healthy dosa topped with grated beetroot.", 40.0, True, img_dosa),
            ("Beetroot Masala Dosa", "Dosa filled with beetroot and seasoned potato mash.", 50.0, True, img_dosa),
            ("Pessarattu", "Healthy green gram crepe served with ginger chutney.", 40.0, True, img_dosa),
            ("Onion Pessarattu", "Green gram crepe topped with freshly chopped onions.", 50.0, True, img_dosa),
            ("Upma Pessarattu", "Traditional green gram crepe stuffed with semolina upma.", 50.0, True, img_dosa),
            ("Uthappam", "Thick savory pancake topped with onion, green chillies, and tomatoes.", 50.0, True, img_dosa),
            ("Idly", "Soft, fluffy steamed rice cakes (3 pcs) served with sambar and chutney.", 30.0, True, img_idly),
            ("Ghee Karam Idly", "Soft idlis tossed in spicy karam powder and hot ghee.", 40.0, True, img_idly),
            ("Sambar Idly", "Soft idlis immersed in piping hot flavorful sambar.", 40.0, True, img_idly),
            ("Vada", "Crispy, deep-fried lentil donuts (2 pcs) served with chutney.", 40.0, True, img_idly),
            ("2 Idly 1 vada", "Perfect combo of two soft steamed idlis and one crispy vada.", 40.0, True, img_idly),
            ("Sambar Vada", "Crispy vadas soaked in hot, spicy lentil sambar.", 50.0, True, img_idly),
            ("Mysore Bonda", "Crispy, fluffy deep-fried snacks made with flour and yogurt.", 40.0, True, img_idly),
            ("Puri", "Deep-fried puffed wheat bread served with spiced potato curry (3 pcs).", 50.0, True, img_idly),
            ("Chapati", "Soft whole wheat flatbreads (2 pcs) served with vegetable kurma.", 60.0, True, img_chapati),
            ("Parrota", "Layered flaky flatbread (2 pcs) served with rich veg gravy.", 60.0, True, img_chapati),
            # Non-veg breakfast items
            ("Egg Parota", "Flaky layered parotta chopped and stir-fried with eggs.", 70.0, False, img_chapati),
            ("Egg Chapati", "Soft chapati rolled with a seasoned omelette layer.", 70.0, False, img_chapati),
            ("Dosa with Chicken Curry", "Crispy dosa served with hot, spicy aromatic chicken curry.", 99.0, False, img_dosa),
            ("Puri with Chicken Curry", "Soft puffed puris served with rich, homestyle chicken curry.", 99.0, False, img_idly),
            ("Chapati With Chicken Curry", "Wheat chapatis served with authentic, slow-cooked chicken curry.", 119.0, False, img_chapati),
            ("Parota With Chicken Curry", "Flaky parottas paired with delicious, rich chicken gravy.", 119.0, False, img_chapati)
        ]
        
        for name, desc, price, is_veg, img in breakfast_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Breakfast"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Rice (Fried Rice, Pulaos, Rice Bowls)
        rice_items = [
            # Fried Rice
            ("Veg Fried Rice", "Wok-tossed basmati rice with finely chopped vegetables and light soy sauce.", 99.0, True, img_rice),
            ("Veg Schezwan Fried Rice", "Spicy stir-fried rice loaded with veggies in fiery Schezwan sauce.", 119.0, True, img_rice),
            ("Gobi Fried Rice", "Fragrant rice stir-fried with crispy cauliflower florets.", 129.0, True, img_rice),
            ("Manchuria Fried Rice", "Rice tossed with tasty veg Manchurian balls and seasonings.", 139.0, True, img_rice),
            ("Mushroom Fried Rice", "Stir-fried rice loaded with fresh sliced mushrooms.", 139.0, True, img_rice),
            ("Paneer Fried Rice", "Savory rice tossed with soft, seasoned paneer cubes.", 149.0, True, img_rice),
            ("Kaju Fried Rice", "Premium fried rice garnished with crunchy toasted cashews.", 169.0, True, img_rice),
            ("Egg Fried Rice", "Savory fried rice scrambled with eggs and spring onions.", 129.0, False, img_rice),
            ("Schezwan Egg Fried Rice", "Spicy wok-tossed rice with scrambled eggs and Schezwan spices.", 139.0, False, img_rice),
            ("Chicken Fried Rice", "Classic stir-fried rice loaded with seasoned chicken bits.", 159.0, False, img_rice),
            ("Schezwan Chicken Fried Rice", "Fiery, spicy stir-fried rice with chicken chunks in Schezwan sauce.", 169.0, False, img_rice),
            ("Prawns Fried Rice", "Delicious rice wok-tossed with tender prawns and scallions.", 189.0, False, img_rice),
            ("Non Veg Mixed Fried Rice", "Ultimate combo fried rice with chicken, prawns, and egg.", 199.0, False, img_rice),
            # Pulaos
            ("Veg Pulao", "Mildly spiced fragrant rice cooked with mixed vegetables.", 139.0, True, img_rice),
            ("Paneer Pulao", "Aromatic long grain rice cooked with rich, spiced paneer pieces.", 169.0, True, img_rice),
            ("Kaju Pulao", "Slow-cooked rice seasoned with whole spices and cashews.", 169.0, True, img_rice),
            ("Chicken Pulao", "Fragrant rice cooked in a rich, flavorful chicken broth.", 179.0, False, img_rice),
            ("Fry Piece Chicken Pulao", "Aromatic pulao topped with crispy, spicy fried chicken pieces.", 179.0, False, img_rice),
            ("Prawns Pulao", "Spiced long-grain rice layered with seasoned juicy prawns.", 229.0, False, img_rice),
            ("Zest Special Pachi Mirchi Kodi Pulao", "Chef special extra-spicy pulao cooked with green chili chicken.", 189.0, False, img_rice),
            # Rice Bowls
            ("Tomato Rice Bowl", "Tangy, spiced tomato rice served in a compact single-portion bowl.", 89.0, True, img_rice),
            ("Aloo 65 Rice Bowl", "Spiced rice bowl topped with crispy, fiery Aloo 65 chunks.", 99.0, True, img_rice),
            ("Paneer Rice Bowl", "Sleek bowl with aromatic rice, layered with paneer curry.", 119.0, True, img_rice),
            ("Sambar Rice Bowl", "Traditional comforting rice pre-mixed with hot lentil sambar.", 99.0, True, img_rice),
            ("Curd Rice Bowl", "Cooling, tempered yogurt rice served with pickle.", 90.0, True, img_rice),
            ("Chicken Sambar Rice Bowl", "Hearty bowl of warm sambar rice topped with chicken bits.", 129.0, False, img_rice),
            ("Chilli Chicken Rice Bowl", "Steamed rice bowl topped with Indo-Chinese spicy Chilli Chicken.", 139.0, False, img_rice),
            ("Chicken 65 Rice Bowl", "Steamed rice bowl paired with spicy, deep-fried Chicken 65.", 139.0, False, img_rice)
        ]
        
        for name, desc, price, is_veg, img in rice_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Rice"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Noodles
        noodle_items = [
            ("Veg Noodles", "Classic stir-fried noodles with crisp, colorful julienned vegetables.", 100.0, True, img_noodle),
            ("Schezwan Veg Noodles", "Spicy, wok-tossed noodles in fiery Schezwan chili paste.", 109.0, True, img_noodle),
            ("Manchurian Noodles", "Savory noodles served with tangy veg Manchurian gravy.", 119.0, True, img_noodle),
            ("Gobi Manchurian Noodles", "Noodles topped with crunchy, sweet-and-sour Gobi Manchurian.", 129.0, True, img_noodle),
            ("Chilli Garlic Noodles", "Garlicky, spicy noodles tossed with green onions and bell peppers.", 119.0, True, img_noodle),
            ("Paneer Noodles", "Wok-tossed noodles cooked with soft, seasoned paneer cubes.", 139.0, True, img_noodle),
            ("Mushroom Noodles", "Delicious stir-fried noodles tossed with fresh sliced mushrooms.", 139.0, True, img_noodle),
            ("Egg Noodles", "Savory noodles scrambled with egg shreds and light soy sauce.", 119.0, False, img_noodle),
            ("Chicken Noodles", "Classic stir-fried noodles tossed with seasoned chicken shreds.", 139.0, False, img_noodle),
            ("Schezwan Chicken Noodles", "Spicy Chinese noodles with tender chicken in Schezwan chili sauce.", 149.0, False, img_noodle),
            ("Mixed Non Veg Noodles", "Combo wok-tossed noodles with chicken, egg, and prawns.", 169.0, False, img_noodle)
        ]
        
        for name, desc, price, is_veg, img in noodle_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Noodles"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Shawarma
        shawarma_items = [
            ("Paneer 65 Shawarma", "Crispy spiced Paneer 65 wrapped in soft bread with garlic sauce.", 99.0, True, img_shawarma),
            ("Paneer Tikka Shawarma", "Tandoori paneer tikka chunks with onions and mint sauce.", 120.0, True, img_shawarma),
            ("Paneer Shawarma with Salad (Khubhus)", "Shredded paneer, fresh salad, and mayo inside Arabic Khubhus.", 110.0, True, img_shawarma),
            ("Paneer Shawarma without Salad (Khubhus)", "Rich paneer and extra garlic mayo inside soft Khubhus bread.", 120.0, True, img_shawarma),
            ("Chicken Shawarma with Salad (Rumali)", "Classic chicken, mayo, and pickles rolled inside paper-thin Rumali roti.", 110.0, False, img_shawarma),
            ("Chicken Shawarma without Salad (Rumali)", "Packed with roasted chicken and extra mayonnaise in Rumali roti.", 120.0, False, img_shawarma),
            ("Chicken Tikka Shawarma (Rumali)", "Spicy grilled chicken tikka and mint mayo in Rumali roti.", 130.0, False, img_shawarma),
            ("Chicken Shawarma with Salad (Khubhus)", "Juicy chicken shavings, fresh salad, and garlic sauce in Khubhus.", 110.0, False, img_shawarma),
            ("Chicken Shawarma without Salad (Khubhus)", "Loaded roasted chicken shavings and heavy mayo inside Khubhus.", 120.0, False, img_shawarma),
            ("Chicken Samoli with Salad", "Succulent chicken fillings served in a fresh Samoli roll with greens.", 120.0, False, img_shawarma),
            ("Chicken Samoli without Salad", "Heavy roasted chicken fillings in a fresh Samoli roll with extra garlic cream.", 130.0, False, img_shawarma),
            ("Supreme Served with Salad Burned Chicken", "Chef special: double roasted burned chicken shavings with salad and mayo.", 150.0, False, img_shawarma),
            ("Pocket Shawarma", "Sleek pocket pita stuffed with spiced chicken shavings and sauce.", 109.0, False, img_shawarma)
        ]
        
        for name, desc, price, is_veg, img in shawarma_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Shawarma"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Biryani
        biryani_items = [
            ("Veg DUM Biryani", "Slow-cooked fragrant basmati rice layered with aromatic vegetables.", 149.0, True, img_biryani),
            ("Paneer Biryani", "Fragrant biryani rice layered with marinated spiced paneer cubes.", 220.0, True, img_biryani),
            ("Mushroom Biryani", "Aromatic slow-cooked rice cooked with spiced earthy mushrooms.", 220.0, True, img_biryani),
            ("Kaju Biryani", "Rich aromatic rice cooked with roasted cashews and spices.", 220.0, True, img_biryani),
            ("Chicken DUM Biryani (Single)", "A single portion of slow-cooked classic chicken dum biryani.", 139.0, False, img_biryani),
            ("Chicken Dum Biryani (Full)", "A full generous serving of rich aromatic chicken dum biryani.", 179.0, False, img_biryani),
            ("Chicken Rambo Biryani (2pcs)", "Double chicken drumsticks cooked on dum with premium basmati rice.", 259.0, False, img_biryani),
            ("Chicken Wings Biryani (3pcs)", "Aromatic biryani rice served with 3 pieces of juicy spiced chicken wings.", 259.0, False, img_biryani),
            ("Chicken Fry Piece Biryani", "Aromatic rice topped with crispy, deeply seasoned fried chicken pieces.", 269.0, False, img_biryani),
            ("Chicken Boneless Biryani", "Biryani rice cooked with tender, melt-in-the-mouth boneless chicken pieces.", 269.0, False, img_biryani),
            ("Chicken Mughlai Biryani", "Rich and creamy Mughlai-style chicken cooked with aromatic rice.", 269.0, False, img_biryani),
            ("Tandoori Chicken Biryani", "Basmati rice paired with smoky, clay-oven roasted tandoori chicken.", 279.0, False, img_biryani),
            ("Tangdi Chicken Biryani", "Delicious biryani topped with roasted chicken drumsticks.", 279.0, False, img_biryani),
            ("Prawns Biryani", "Fragrant long grain rice layered with spiced, tender prawns.", 289.0, False, img_biryani),
            ("Fish Biryani", "Aromatic basmati rice cooked with seasoned fish fillets.", 289.0, False, img_biryani)
        ]
        
        for name, desc, price, is_veg, img in biryani_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Biryani"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Burgers
        burger_items = [
            ("Veg Burger", "Crispy vegetable patty with lettuce, tomato, and classic mayo.", 80.0, True, img_burger),
            ("Veg Cheese Burger", "Sizzling veg patty loaded with a slice of melted cheddar cheese.", 100.0, True, img_burger),
            ("Paneer Burger", "Thick crispy paneer patty topped with standard burger sauce.", 100.0, True, img_burger),
            ("Paneer Cheese Burger", "Crispy paneer patty topped with rich melted cheese and lettuce.", 119.0, True, img_burger),
            ("Chicken Burger", "Juicy seasoned chicken patty with lettuce and burger sauce.", 110.0, False, img_burger),
            ("Chicken Cheese Burger", "Juicy chicken patty topped with a slice of premium cheddar cheese.", 130.0, False, img_burger)
        ]
        
        for name, desc, price, is_veg, img in burger_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Burgers"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Pizza
        pizza_items = [
            ("Veg Pizza (Small)", "Individual crust with marinara, veggies, and mozzarella cheese.", 149.0, True, img_pizza),
            ("Veg Pizza (Large)", "Large crust with marinara, loaded veggies, and heavy mozzarella.", 179.0, True, img_pizza),
            ("Paneer Pizza (Small)", "Individual crust topped with spiced paneer cubes and capsicum.", 169.0, True, img_pizza),
            ("Paneer Pizza (Large)", "Family-size crust topped with spiced paneer cubes, capsicum, and olives.", 199.0, True, img_pizza),
            ("Veg Corn Pizza (Small)", "Small sweet corn and cheese pizza.", 169.0, True, img_pizza),
            ("Veg Corn Pizza (Large)", "Large crust loaded with sweet corn, onions, and cheese.", 199.0, True, img_pizza),
            ("Chicken Cheese Pizza (Small)", "Personal-size pizza topped with shredded chicken and cheese.", 210.0, False, img_pizza),
            ("Chicken Cheese Pizza (Large)", "Large crust loaded with chicken shavings and mozzarella.", 250.0, False, img_pizza),
            ("Chicken Double Cheese Pizza (Small)", "Small double cheese crust topped with chicken shreds.", 230.0, False, img_pizza),
            ("Chicken Double Cheese Pizza (Large)", "Large crust with double cheese layer and heavy chicken toppings.", 280.0, False, img_pizza),
            ("Chicken Corn Pizza (Small)", "Personal pizza topped with sweet corn and chicken chunks.", 220.0, False, img_pizza),
            ("Chicken Corn Pizza (Large)", "Large crust topped with seasoned sweet corn and chicken chunks.", 260.0, False, img_pizza)
        ]
        
        for name, desc, price, is_veg, img in pizza_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Pizza"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Sandwiches
        sandwich_items = [
            ("Veg Sandwich", "Plain double-decker bread sandwich with cucumber, tomato, and butter.", 80.0, True, img_sandwich),
            ("Veg Cheese Sandwich", "Grilled sandwich loaded with fresh veggies and cheddar cheese.", 90.0, True, img_sandwich),
            ("Paneer Sandwich", "Toasted sandwich stuffed with spiced crumbled paneer.", 100.0, True, img_sandwich),
            ("Paneer Cheese Sandwich", "Grilled sandwich loaded with paneer and melted cheese.", 120.0, True, img_sandwich),
            ("Veg Wrap", "Soft flatbread roll stuffed with crispy veg cutlets and sauce.", 90.0, True, img_sandwich),
            ("Paneer Wrap", "Tortilla roll stuffed with seasoned grilled paneer and salad.", 100.0, True, img_sandwich),
            ("Egg Sandwich", "Toasted sandwich loaded with sliced boiled eggs and black pepper.", 100.0, False, img_sandwich),
            ("Chicken Sandwich", "Toasted bread sandwich stuffed with shredded chicken in mayo.", 119.0, False, img_sandwich),
            ("Chicken Cheese Sandwich", "Grilled sandwich with chicken shavings and melted cheddar slice.", 119.0, False, img_sandwich),
            ("Egg Wrap", "Soft wrap loaded with scrambled eggs, onions, and mayo.", 110.0, False, img_sandwich)
        ]
        
        for name, desc, price, is_veg, img in sandwich_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Sandwiches"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Starters
        starter_items = [
            # Veg Starters
            ("Veg Manchurian", "Indo-Chinese deep-fried vegetable balls in tangy, savory sauce.", 90.0, True, img_starter),
            ("Gobi Manchurian", "Crispy cauliflower florets tossed in sweet and sour Manchurian sauce.", 110.0, True, img_starter),
            ("Gobi 65", "Spicy, deep-fried cauliflower marinated in yogurt and red spices.", 120.0, True, img_starter),
            ("Chilli Paneer", "Crispy paneer cubes tossed with bell peppers and green chillies.", 159.0, True, img_starter),
            ("Paneer 65", "Deep-fried marinated paneer chunks tossed with curry leaves.", 159.0, True, img_starter),
            ("Paneer Majestic", "Classic Hyderabad starter: paneer strips cooked in smooth yogurt sauce.", 159.0, True, img_starter),
            ("Dragon Paneer", "Spicy sweet paneer strips tossed in chili paste and cashews.", 169.0, True, img_starter),
            ("Chilli Mushroom", "Batter-fried mushrooms stir-fried with onions and bell peppers.", 159.0, True, img_starter),
            ("Mushroom Salt and Pepper", "Crispy fried mushrooms seasoned with salt and fresh cracked pepper.", 169.0, True, img_starter),
            ("Chilli Baby Corn", "Crispy baby corn stir-fried in hot chili garlic sauce.", 159.0, True, img_starter),
            ("Baby Corn Manchurian", "Deep-fried baby corn tossed in soy-garlic Manchurian glaze.", 159.0, True, img_starter),
            # Non Veg Starters
            ("Egg Manchurian", "Deep-fried battered boiled eggs tossed in savory Manchurian sauce.", 99.0, False, img_starter),
            ("Chilli Egg", "Fried boiled eggs stir-fried with green chilies, onions, and soy.", 119.0, False, img_starter),
            ("Egg 65", "Spicy deep-fried egg chunks seasoned with curry leaves.", 129.0, False, img_starter),
            ("Chicken Manchurian", "Crispy chicken cubes tossed in classic soy-garlic Manchurian sauce.", 169.0, False, img_starter),
            ("Chicken 65", "Classic South Indian fiery deep-fried chicken marinated in red spices.", 169.0, False, img_starter),
            ("Chilli Chicken", "Indo-Chinese classic stir-fry chicken with soy, garlic, and chilies.", 179.0, False, img_starter),
            ("Chicken Majestic", "Dry chicken strips marinated in yogurt and yellow spices, shallow fried.", 189.0, False, img_starter),
            ("Chicken Lollipop", "Spicy deep-fried chicken drumettes shaped like lollipops (5 pcs).", 219.0, False, img_starter),
            ("Chicken Drumstick", "Crispy fried breaded chicken legs served with garlic mayo.", 219.0, False, img_starter),
            ("Chicken 555", "Deep-fried chicken strips tossed in red chili sauce and cashews.", 189.0, False, img_starter),
            ("Dragon Chicken", "Sweet and spicy chicken strips stir-fried with bell peppers.", 189.0, False, img_starter),
            ("Chicken Pakodi", "Crispy fried chicken fritters seasoned with ginger and garlic.", 159.0, False, img_starter),
            ("Zest Special Pachi Mirchi Kodi Vepudu", "Super-spicy dry chicken fry tossed with raw green chili paste.", 219.0, False, img_starter),
            # Seafood Starters
            ("Loose Prawns (Dry)", "Deep-fried battered prawns seasoned with salt and chili.", 219.0, False, img_starter),
            ("Chilli Prawns (Wet)", "Batter-fried prawns tossed in green chili soy sauce gravy.", 219.0, False, img_starter),
            ("Fried Fish (Dry)", "Crispy pan-fried fish fillets seasoned with Indian spices.", 219.0, False, img_starter),
            ("Apollo Fish (Wet)", "Deep-fried fish fillets tossed in spicy yogurt-chili sauce.", 219.0, False, img_starter)
        ]
        
        for name, desc, price, is_veg, img in starter_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Starters"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Juices
        juice_items = [
            ("ABC Juice", "Healthy mix of fresh Apple, Beetroot, and Carrot juice.", 80.0, True, img_juice),
            ("Apple Juice", "Freshly pressed sweet apples, served chilled.", 80.0, True, img_juice),
            ("Beetroot Juice", "Vibrant and healthy freshly squeezed beetroot juice.", 60.0, True, img_juice),
            ("Banana Juice", "Refreshing smooth blended banana drink.", 50.0, True, img_juice),
            ("Carrot Juice", "100% natural, freshly squeezed sweet carrot juice.", 60.0, True, img_juice),
            ("Grape Juice", "Chilled juice from fresh dark seedless grapes.", 60.0, True, img_juice),
            ("Kabuga Juice", "Traditional sweet seasonal fruit drink.", 50.0, True, img_juice),
            ("Papaya Juice", "Fresh pulpy papaya juice, high in vitamins.", 50.0, True, img_juice),
            ("Pineapple Juice", "Tangy and sweet freshly pressed pineapple juice.", 50.0, True, img_juice),
            ("Pomegranate Juice", "Rich, sweet juice packed with fresh pomegranate seeds.", 80.0, True, img_juice),
            ("Sapota Juice", "Sweet, creamy sapodilla (chikoo) shake.", 50.0, True, img_juice),
            ("Watermelon Juice", "Perfect summer refresher made from fresh sweet watermelons.", 50.0, True, img_juice),
            ("Orange Juice", "Freshly squeezed citrus orange juice.", 70.0, True, img_juice),
            ("Mosambi Juice", "Sweet lime juice, fresh and refreshing.", 70.0, True, img_juice),
            ("Mango Juice", "Thick and sweet juice made from fresh ripe mangoes.", 70.0, True, img_juice)
        ]
        
        for name, desc, price, is_veg, img in juice_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Juices"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Milkshakes (includes Thick Shakes)
        shake_items = [
            # Milkshakes
            ("Belgium Chocolate Milkshake", "Creamy chocolate ice cream blended with cold milk.", 120.0, True, img_shake),
            ("Kit Kat Milkshake", "Classic shake blended with crispy Kit Kat bars.", 120.0, True, img_shake),
            ("Oreo Milkshake", "Milkshake blended with Oreo cookies and chocolate syrup.", 120.0, True, img_shake),
            ("Triple Choco Chip Milkshake", "Extra chocolatey shake with crunchy chocolate chips.", 120.0, True, img_shake),
            ("Oreo Caramel Milkshake", "Blended oreos with a rich drizzle of sweet caramel.", 120.0, True, img_shake),
            ("Cold Coffee", "Chilled brewed coffee blended with milk and vanilla ice cream.", 120.0, True, img_shake),
            ("Strawberry Milkshake", "Creamy vanilla milk blended with sweet strawberry crush.", 120.0, True, img_shake),
            ("Butterscotch Milkshake", "Rich butterscotch shake topped with crunchy butterscotch bits.", 120.0, True, img_shake),
            # Thick shakes
            ("Belgium Chocolate Thick Shake", "Super-thick rich shake made with premium Belgian chocolate ice cream.", 180.0, True, img_shake),
            ("Kit Kat Thick Shake", "Dense blended thick shake loaded with crushed Kit Kat.", 180.0, True, img_shake),
            ("Oreo Thick Shake", "Extra-thick shake packed with vanilla ice cream and Oreo cookies.", 180.0, True, img_shake),
            ("Triple Choco Chip Thick Shake", "Thick fudge shake loaded with chocolate chips.", 180.0, True, img_shake),
            ("Oreo Caramel Thick Shake", "Dense thick shake with oreo chunks and salted caramel.", 180.0, True, img_shake),
            ("Cold Coffee Thick Shake", "Rich, extra-thick blended coffee shake.", 180.0, True, img_shake),
            ("Strawberry Thick Shake", "Thick strawberry ice cream shake.", 180.0, True, img_shake),
            ("Butterscotch Thick Shake", "Thick, decadent butterscotch crunch shake.", 180.0, True, img_shake)
        ]
        
        for name, desc, price, is_veg, img in shake_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Milkshakes"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        # Category: Mocktails
        mocktail_items = [
            ("Blue Curacao Mocktail", "Chilled blue orange-flavored syrup with lime and soda.", 60.0, True, img_mocktail),
            ("Mint Mojito", "A refreshing blend of fresh mint, lime juice, sugar, and sparkling soda.", 60.0, True, img_mocktail),
            ("Green Apple Mocktail", "Crisp green apple syrup with soda and mint leaves.", 60.0, True, img_mocktail),
            ("Raspberry Mocktail", "Sweet raspberry blend with a splash of lime and soda.", 60.0, True, img_mocktail),
            ("Strawberry Mocktail", "Fizzy strawberry soda mocktail over crushed ice.", 60.0, True, img_mocktail),
            ("Bubble-gum Mocktail", "Fun sweet bubble-gum flavored fizzy mocktail.", 70.0, True, img_mocktail),
            ("Virgin Mojito", "Classic refresher with crushed mint, lime wedges, and sprite.", 60.0, True, img_mocktail),
            ("Watermelon Mocktail", "Bubbly watermelon soda mocktail.", 60.0, True, img_mocktail),
            ("Red Wine Mocktail", "A non-alcoholic spiced grape mocktail mimicking red wine flavor.", 70.0, True, img_mocktail)
        ]
        
        for name, desc, price, is_veg, img in mocktail_items:
            menu_items.append(models.MenuItem(
                category_id=categories["Mocktails"].id,
                name=name,
                description=desc,
                price=price,
                is_veg=is_veg,
                is_available=True,
                availability_status="In Stock",
                image=img
            ))

        for item in menu_items:
            db.add(item)
            
        db.commit()
        print(f"Successfully seeded {len(menu_items)} menu items.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

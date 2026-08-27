"""Generates a synthetic dataset that reproduces the exact column names and
"messiness" of the real Kaggle "House Price" dataset by Juhi Bhojani
(https://www.kaggle.com/datasets/juhibhojani/house-price), for use when that
dataset cannot be downloaded (e.g. no network access to kaggle.com).

To use the REAL dataset instead, just download it with the Kaggle CLI:

    kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip

and skip running this script — every column name here matches the real file,
so nothing else in the notebook needs to change.
"""
import numpy as np
import pandas as pd
import random

rng = np.random.default_rng(42)
random.seed(42)

N = 8000

cities = ["Mumbai", "Pune", "Bangalore", "Delhi", "Noida", "Gurgaon", "Hyderabad",
          "Chennai", "Kolkata", "Ahmedabad"]
localities = {
    "Mumbai": ["Andheri West", "Powai", "Thane West", "Borivali East", "Kandivali West",
               "Malad West", "Chembur", "Dadar West"],
    "Pune": ["Wakad", "Hinjewadi", "Kharadi", "Baner", "Viman Nagar", "Kothrud", "Hadapsar"],
    "Bangalore": ["Whitefield", "Electronic City", "Marathahalli", "HSR Layout",
                  "Sarjapur Road", "Yelahanka"],
    "Delhi": ["Dwarka", "Rohini", "Vasant Kunj", "Karol Bagh", "Janakpuri"],
    "Noida": ["Sector 62", "Sector 137", "Sector 78", "Sector 150"],
    "Gurgaon": ["Sector 57", "DLF Phase 3", "Sohna Road", "Sector 82"],
    "Hyderabad": ["Gachibowli", "Kondapur", "Madhapur", "Kukatpally"],
    "Chennai": ["OMR", "Velachery", "Anna Nagar", "Porur"],
    "Kolkata": ["New Town", "Salt Lake", "Rajarhat", "Behala"],
    "Ahmedabad": ["Bopal", "Satellite", "Vastrapur", "Maninagar"],
}
societies = [f"{w} {s}" for w in
             ["Green", "Sunrise", "Royal", "Silver", "Palm", "Lake", "Golden", "Orchid",
              "Maple", "Emerald"]
             for s in ["Residency", "Enclave", "Heights", "Towers", "Gardens", "Park",
                       "County", "Woods"]]

furnishing_opts = ["Furnished", "Semi-Furnished", "Unfurnished"]
transaction_opts = ["New Property", "Resale"]
ownership_opts = ["Freehold", "Leasehold", "Co-operative Society", "Power Of Attorney"]
facing_opts = ["East", "West", "North", "South", "North-East", "North-West",
               "South-East", "South-West"]
overlooking_opts = ["Garden/Park", "Main Road", "Pool", "Club", "Not Available"]
status_opts = ["Ready to Move", "Under Construction"]

rows = []
for i in range(N):
    city = random.choice(cities)
    locality = random.choice(localities[city])
    location = f"{locality}, {city}"
    society = random.choice(societies) if random.random() > 0.15 else np.nan
    bhk = random.choice([1, 2, 2, 3, 3, 3, 4, 4, 5])
    base_area = bhk * rng.normal(430, 60)
    carpet_area = max(250, base_area * rng.uniform(0.75, 0.95))
    super_area = carpet_area * rng.uniform(1.1, 1.35)

    def area_str(a):
        if random.random() < 0.1:
            return f"{round(a / 10.764)} sqm"
        return f"{round(a)} sqft"

    carpet_area_str = area_str(carpet_area) if random.random() > 0.12 else np.nan
    super_area_str = area_str(super_area) if random.random() > 0.35 else np.nan

    total_floors = random.choice([4, 5, 6, 8, 10, 12, 15, 20, 25])
    floor_num_val = random.randint(0, total_floors)
    floor_str = f"Ground out of {total_floors}" if floor_num_val == 0 else f"{floor_num_val} out of {total_floors}"
    if random.random() < 0.03:
        floor_str = f"Basement out of {total_floors}"

    bathroom = min(bhk + random.choice([-1, 0, 0, 1]), 6)
    bathroom = max(1, bathroom)
    balcony = random.choice([0, 1, 1, 2, 2, 3])
    car_parking = random.choice([0, 1, 1, 2])

    furnishing = random.choice(furnishing_opts)
    transaction = random.choice(transaction_opts)
    ownership = random.choice(ownership_opts)
    facing = random.choice(facing_opts)
    overlooking = random.choice(overlooking_opts)
    status = random.choice(status_opts)

    tier1 = {"Mumbai": 22000, "Delhi": 16000, "Bangalore": 9500, "Gurgaon": 11000,
             "Noida": 7500, "Pune": 8500, "Hyderabad": 7000, "Chennai": 7500,
             "Kolkata": 6500, "Ahmedabad": 5500}
    base_psf = tier1[city] * rng.uniform(0.7, 1.4)
    if furnishing == "Furnished":
        base_psf *= 1.08
    if transaction == "New Property":
        base_psf *= 1.05
    price = base_psf * carpet_area * rng.uniform(0.9, 1.1)

    def price_str(p):
        if random.random() < 0.02:
            return "Call for Price"
        if p >= 1e7:
            return f"{round(p / 1e7, 2)} Cr"
        return f"{round(p / 1e5, 2)} Lac"

    amount_str = price_str(price)

    title = f"{bhk} BHK Flat for Sale in {locality}"
    description = f"Spacious {bhk} BHK apartment located in {locality}, {city}. {furnishing} with modern amenities."
    dimensions = f"{round(rng.uniform(20, 60))}x{round(rng.uniform(20, 60))}"
    plot_area = np.nan if random.random() > 0.2 else f"{round(super_area * rng.uniform(1.0, 1.4))} sqft"

    rows.append({
        "Index": i,
        "Title": title,
        "Description": description,
        "Amount(in rupees)": amount_str,
        "Price (in rupees)": round(price) if random.random() > 0.3 else np.nan,
        "location": location,
        "Carpet Area": carpet_area_str,
        "Status": status,
        "Floor": floor_str,
        "Transaction": transaction,
        "Furnishing": furnishing,
        "facing": facing if random.random() > 0.25 else np.nan,
        "overlooking": overlooking if random.random() > 0.4 else np.nan,
        "Society": society,
        "Bathroom": bathroom if random.random() > 0.05 else np.nan,
        "Balcony": balcony if random.random() > 0.2 else np.nan,
        "Car Parking": car_parking if random.random() > 0.5 else np.nan,
        "Ownership": ownership if random.random() > 0.3 else np.nan,
        "Super Area": super_area_str,
        "Dimensions": dimensions if random.random() > 0.7 else np.nan,
        "Plot Area": plot_area,
    })

df = pd.DataFrame(rows)
df.to_csv("data/house_prices.csv", index=False)
print(df.shape)
print(df.head())

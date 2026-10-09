"""Uber-versus-used-car break-even model. Standard library only."""

A = dict(years=5, uber=50.0, miles=10.0, prices=[5000,10000,15000],
         tax_rate=.04712, initial_fees=300.0, insurance=1500.0,
         registration=500.0, fixed_maintenance=1000.0, parking=0.0,
         fuel_price=5.0, mpg=25.0, wear_per_mile=.15,
         resale_rate=.30, opportunity_rate=.05)

def scenario(price, a=A):
    months = a["years"] * 12
    variable = a["miles"] * (a["fuel_price"] / a["mpg"] + a["wear_per_mile"])
    annual_fixed = a["insurance"] + a["registration"] + a["fixed_maintenance"] + a["parking"]
    fixed = (price * (1 + a["tax_rate"]) + a["initial_fees"]
             + annual_fixed * a["years"]
             + price * a["opportunity_rate"] * a["years"]
             - price * a["resale_rate"])
    rides = fixed / (a["uber"] - variable)
    return price, fixed, variable, rides, rides/months, rides/months/2

if __name__ == "__main__":
    print("Price | Net fixed cost | Variable/ride | 5-year rides | rides/month | round trips/month")
    for p in A["prices"]:
        price, fixed, variable, rides, monthly, roundtrips = scenario(p)
        print("$"+format(price,",.0f"), "| $"+format(fixed,",.2f"), "| $"+format(variable,",.2f"),
              "|", format(rides,".0f"), "|", format(monthly,".1f"), "|", format(roundtrips,".1f"))

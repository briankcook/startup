/*
Copyright Brian Cook - © 2014 - All Rights Reserved

TODO:
custom hire/fire amounts
"double", "halve" and "max" buttons
cash per click based on company size
IPOs (to clear the first building hurdle)
better UI, displays costs, hidden elements
Stock fluctuations affecting assets
productivity multipliers (new office, contentment, vacation time, ...)
"branch inward" with top-level staying top level, and promoting up subordinates as needed
hire full trees (eg 1 director, 4 middlemanagement, 16 managers, 320 workers)
auto-satisfy requisites (eg try to hire 320 workers, hire additional 16 managers, 4 middlemen)
departments (marketing, pr, hr, r&d, ...) (create departments one at a time as desired, hire/fire within)
takeovers of competing companies (other companies grow organically, purchaseable)
lobbying
upgrades (infrastructure, patents.. late game speed is appropriate, but early game would be slow)
*/

// main loop

window.setInterval(interval,1000);

function interval() {
  if (money.dollars < 0) {
    money.dollars = Math.floor(money.dollars * 1.001)
  }
  money.earn(people.earnings());
  money.pay(places.rent(), true);
  status.age();
  refresh();
}

// display
var ln = "<br />";

function button(type, action, label) {
  return "<a href='javascript:" + action + ";refresh();' class='" + type + " button'>" + label + "</a>";
}

function text(name, label, contents) {
  return "<span class='text'>" + label + "<ins id='" + name + "'>" + contents + "</ins></span>";
}

function table(id,a,b,c) {
  return "<div id='" + id + "' class='employee'><div class='left'>" + a + "</div><div class='right'>" + b + "</div>" + c + "</div>";
}

function hirefirerow(type) {
  return "<div>"
         + button("hire","people.hire(people." + type + ")","Hire 1")
         + button("hire","people.hire(people." + type + ", 10)","Hire 10")  
         + button("hire","people.hire(people." + type + ", 100)","Hire 100")
         + button("hire","people.hire(people." + type + ", 1000)","Hire 1000")
         + "</div><div>"
         + button("fire","people.fire(people." + type + ")","Fire 1")
         + button("fire","people.fire(people." + type + ", 10)","Fire 10")  
         + button("fire","people.fire(people." + type + ", 100)","Fire 100")
         + button("fire","people.fire(people." + type + ", 1000)","Fire 1000")
		 + "</div>"
}

function init() {
  document.getElementById("body").innerHTML = ""
  + ln 
  + button(null,"money.earn(100)","Work hard") 
  + text("assets", "Assets: $" , money.dollars)
  + ln
  + text("revenue", "Revenue: " , (people.earnings() - places.rent()))
  + ln
  + "<div id='employees'>"
  + table("workers", text("wcount", "Workers: " , people.worker.count),
                     text("wcost", "Cost: $", people.worker.hire),
					 hirefirerow("worker"))
  + ln
  + table("managers", text("mcount", "Managers: " , people.manager.count),
                      text("mcost", "Cost: $", people.manager.hire),
				   	  hirefirerow("manager"))
  + ln
  + table("middlemen", text("mmcount", "Middle Management: " , people.middleman.count),
                       text("mmcost", "Cost: $", people.middleman.hire),
					   hirefirerow("middleman"))
  + ln
  + table("directors", text("dcount", "Directors: " , people.director.count),
                       text("dcost", "Cost: $", people.director.hire),
					   hirefirerow("director"))
  + ln
  + table("vps", text("vpcount", "Vice Presidents: " , people.vp.count),
                 text("vpcost", "Cost: $", people.vp.hire),
			     hirefirerow("vp"))
  + ln
  + table("fellows", text("fcount", "Fellows: " , people.fellow.count),
                     text("fcost", "Cost: $", people.fellow.hire),
					 hirefirerow("fellow"))
  + ln
  + table("officers", text("ocount", "Officers: " , people.officer.count),
                      text("ocost", "Cost: $", people.officer.hire),
					  hirefirerow("officer"))
  + ln
  + table("board", text("bmcount", "Board Members: " , people.board.count),
                   text("bmcost", "Cost: $", people.board.hire),
				   hirefirerow("board"))
  + "</div>"
  + ln
  + text("tcount", "Total Employees: " , people.total())
  + ln 
  + text("capcount", "Desks: " , places.capacity())
  + ln 
  + button(null,"places.upgrade()","Upgrade") 
  + text("location", "Office Location: " , places.rented.name)
  + ln 
  + button(null,"places.buy(places.building)","Buy") 
  + text("bcount", "Buildings owned: " , places.building.count)
  + button(null,"places.sell(places.building)","Sell") 
  + ln 
  + button(null,"places.buy(places.campus)","Buy") 
  + text("ccount", "Campuses owned: " , places.campus.count)
  + button(null,"places.sell(places.campus)","Sell") 
  + ln 
  + text("status","", status.get());
}

function refresh() {
  document.getElementById("assets").innerHTML = money.dollars;
  document.getElementById("revenue").innerHTML = (people.earnings() - places.rent());
  document.getElementById("wcount").innerHTML = people.worker.count;
  document.getElementById("mcount").innerHTML = people.manager.count;
  document.getElementById("mmcount").innerHTML = people.middleman.count;
  document.getElementById("dcount").innerHTML = people.director.count;
  document.getElementById("vpcount").innerHTML = people.vp.count;
  document.getElementById("fcount").innerHTML = people.fellow.count;
  document.getElementById("ocount").innerHTML = people.officer.count ;
  document.getElementById("bmcount").innerHTML = people.board.count;
  document.getElementById("tcount").innerHTML = people.total();
  document.getElementById("capcount").innerHTML = places.capacity();
  document.getElementById("location").innerHTML = places.rented.name;
  document.getElementById("bcount").innerHTML = places.building.count;
  document.getElementById("ccount").innerHTML = places.campus.count;
  document.getElementById("status").innerHTML = status.get();
}

// Control Blocks

var money = new money();
var people = new people();
var places = new places();
var status = new status();

function money() {
  this.dollars = 0;
  
  this.pay = function(amount, force) {
    if (force || this.dollars >= amount) {
      this.dollars -= amount;
	  return true;
    } else {
        status.set("You do not have the $" + amount + " required.");
      return false;
    }
  }
  
  this.earn = function(amount) {
    this.dollars += amount;
  }
}

function people() {
  this.total = function() {
    return this.worker.size() + this.manager.size() + this.middleman.size() + this.director.size()
	     + this.vp.size() + this.fellow.size() + this.officer.size() + this.board.size() 
  }
  
  this.earnings = function() {
    retval = this.worker.count * this.worker.earn
	       + this.manager.count * this.manager.earn
	       + this.middleman.count * this.middleman.earn
	       + this.director.count * this.director.earn
	       + this.fellow.count * this.fellow.earn
	       + this.vp.count * this.vp.earn
	       + this.board.count * this.board.earn
	       + this.officer.count * this.officer.earn;
	return retval;
  }
  
  this.hire = function(type, count) {
    count = count || 1;
    if (type == this.officer 
    || ((type == this.fellow || type == this.board ) && type.count + count <= type.limiter.count)
    || (type.count + count <= Math.max(type.superior.count, 1) * type.superior.sigma)) {
      if (people.total() + count * type.space <= places.capacity()) {
	    if (money.pay(type.hire * count)) {
	      type.count += count;
  	    }
	  } else { 
	    status.set("Your office is too small to hire this person.");
	  }
    } else {
      status.set("You do not have enough oversight to hire this person.");
    }
  }
  
  this.fire = function(type, count) {
    count = count || 1;
    if (type.count - count >= 0) {
	  if (((type != this.officer && type != this.vp) 
	   || (type == this.officer && type.count - count >= this.board.count) 
	   || (type == this.vp && type.count - count >= this.fellow.count))
	  && (type.subordinate == null || (type.count - count) * type.sigma >= type.subordinate.count)) {
        if (money.pay(type.fire * count)) {
	      type.count -= count;
	    }
	  } else {
	    status.set("You can't fire employees you need.");
	  }
	} else {
	  status.set("Nice try, but you can't fire people who don't work for you.");
	}
  }
  
  this.hiretype = function(name,hire,earn,fire,limiter,superior,space,sigma,subordinate) {
    this.name = name;
    this.hire = hire;
	this.earn = earn;
	this.fire = fire;
	this.count = 0;
	this.limiter = limiter;
	this.superior = superior;
	this.space = space;
	this.sigma = sigma;
	this.subordinate = subordinate;
	this.size = function() {
	  return this.count * this.space;
	}
  }
  
  this.officer = new this.hiretype("Corporate Officer",32000,-3200,64000,null,null,10,4,this.vp);
  this.board = new this.hiretype("Board Member",1920000,3200,64000,this.officer,null,10,null,null);
  this.vp = new this.hiretype("Vice President",16000,-1600,32000,null,this.officer,5,4,this.director);
  this.fellow = new this.hiretype("Fellow",960000,1600,32000,this.vp,null,5,null,null);
  this.director = new this.hiretype("Director",8000,-800,16000,null,this.vp,5,4,this.middleman);
  this.middleman = new this.hiretype("Middle Manager",4000,-400,8000,null,this.director,3,4,this.manager);
  this.manager = new this.hiretype("Manager",2000,-200,4000,null,this.middleman,2,20,this.worker);
  this.worker = new this.hiretype("Worker",1000,100,2000,null,this.manager,1,null,null);
}

function places() {
  this.capacity = function() {
    return this.rented.size + this.building.count * this.building.size + this.campus.count * this.campus.size;
  }
  
  this.rent = function() {
    return this.rented.rent + this.building.count * this.building.upkeep + this.campus.count * this.campus.upkeep;
  }
  
  this.upgrade = function() {
    var upgradeto;
    switch (this.rented) {
	  case this.garage: this.upgradeto = this.loft; break;
	  case this.loft: this.upgradeto = this.suite; break;
	  case this.suite: this.upgradeto = this.office; break;
	  case this.office: this.upgradeto = this.onestory; break;
	  case this.onestory: this.upgradeto = this.twostory; break;
	  case this.twostory: this.upgradeto = this.threestory; break;
	  case this.threestory: this.upgradeto = this.fourstory; break;
	  case this.fourstory: this.upgradeto = this.fivestory; break;
	  case this.fivestory: this.upgradeto = this.none; break;
	}
	if (this.upgradeto == this.none) {
	  if (money.pay(this.building.cost)) {
	    this.rented = this.none;
		this.building.count += 1;
	  }
	} else if (money.pay(this.upgradeto.rent)) {
	  this.rented = this.upgradeto;
	} 
  }
  
  this.buy = function(type) {
    if (money.pay(type.cost)) {
	  type.count += 1;
	} 
  }
  
  this.sell = function(type) {
    if (places.capacity() - type.size >= people.total()) {
	  money.earn(type.cost/2);
	  type.count--;
	} else {
	  status .set("You need this space.  Consider firing some workers.");
	}
  }
  
  this.renttype = function(name,size,rent) {
    this.name = name;
    this.size = size;
    this.rent = rent;
  }
  
  this.none = new this.renttype("Nothing",0,0);
  this.garage = new this.renttype("Your Garage",5,0);
  this.loft = new this.renttype("A Grungy Loft",30,400);
  this.suite = new this.renttype("A Cramped Office Suite",100,2000);
  this.office = new this.renttype("A Modest Office",400,10000);
  this.onestory = new this.renttype("One Floor of an Office Building",1000,30000);
  this.twostory = new this.renttype("Two Floors of an Office Building",2000,60000);
  this.threestory = new this.renttype("Three Floors of an Office Building",3000,90000);
  this.fourstory = new this.renttype("Four Floors of an Office Building",4000,120000);
  this.fivestory = new this.renttype("Five Floors of an Office Building",5000,150000);
  
  this.owntype = function(size,cost,upkeep) {
    this.size = size;
    this.cost = cost;
    this.upkeep = upkeep;
	this.count = 0;
  }
  
  this.building = new this.owntype(5000,81000000,15000);
  this.campus = new this.owntype(25000,324000000,60000);
  
  this.rented = this.garage;
}

function status() {
  this.message = "Welcome to Startup";
  this.count = 0;
  
  this.set = function(s) {
    this.count = 0;
	this.message = s;
  }
  
  this.get = function(fromClick) {
    if (fromClick) {
	  this.set("");
	}
    return this.message;
  }
  
  this.age = function() {
    if (this.count++ > 3) {
	  this.count = 0;
	  this.message = "";
	}
  }
}
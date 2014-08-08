/*
Copyright Brian Cook - © 2014 - All Rights Reserved

TODO:
custom hire/fire amounts
IPOs (to clear the first building hurdle)
better UI, displays costs, hidden elements
Stock fluctuations affecting assets
productivity multipliers (new office, contentment, vacation time, ...)
"branch inward" with top-level staying top level, and promoting up subordinates as needed
hire full trees (eg 1 director, 5 middlemanagement, 25 managers, 625 workers)
auto-satisfy requisites (eg try to hire 1000 workers, hire additional 20 managers, 4 middlemen)
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
  refresh();
}

// display
var ln = "<br />";

function button(action, label) {
  return "<button onclick='" + action + ";refresh()'>" + label + "</button>";
}

function text(contents) {
  return "<span class='text'>" + contents + "</span>";
}

function refresh() {
  document.getElementById("body").innerHTML = ""
  + ln 
  + button("money.earn(100)","Work hard") 
  + text("Assets: $" + money.dollars)
  + ln
  + text("Revenue: " + (people.earnings() - places.rent()))
  + ln
  + button("people.hire(people.worker)","Hire")
  + button("people.hire(people.worker, 10)","Hire 10")  
  + button("people.hire(people.worker, 100)","Hire 100")  
  + text("Workers: " + people.worker.count)  
  + button("people.fire(people.worker, 100)","Fire 100") 
  + button("people.fire(people.worker, 10)","Fire 10") 
  + button("people.fire(people.worker)","Fire") 
  + ln
  + button("people.hire(people.manager)","Hire")
  + button("people.hire(people.manager, 10)","Hire 10")  
  + button("people.hire(people.manager, 100)","Hire 100")  
  + text("Managers: " + people.manager.count)  
  + button("people.fire(people.manager, 100)","Fire 100") 
  + button("people.fire(people.manager, 10)","Fire 10") 
  + button("people.fire(people.manager)","Fire") 
  + ln
  + button("people.hire(people.middleman)","Hire")
  + button("people.hire(people.middleman, 10)","Hire 10")  
  + button("people.hire(people.middleman, 100)","Hire 100")  
  + text("Middle Management: " + people.middleman.count)  
  + button("people.fire(people.middleman, 100)","Fire 100") 
  + button("people.fire(people.middleman, 10)","Fire 10") 
  + button("people.fire(people.middleman)","Fire") 
  + ln
  + button("people.hire(people.director)","Hire")
  + button("people.hire(people.director, 10)","Hire 10")  
  + button("people.hire(people.director, 100)","Hire 100")  
  + text("Directors: " + people.director.count)  
  + button("people.fire(people.director, 100)","Fire 100") 
  + button("people.fire(people.director, 10)","Fire 10") 
  + button("people.fire(people.director)","Fire") 
  + ln
  + button("people.hire(people.vp)","Hire")
  + button("people.hire(people.vp, 10)","Hire 10")  
  + button("people.hire(people.vp, 100)","Hire 100")  
  + text("Vice Presidents: " + people.vp.count)  
  + button("people.fire(people.vp, 100)","Fire 100") 
  + button("people.fire(people.vp, 10)","Fire 10") 
  + button("people.fire(people.vp)","Fire") 
  + ln
  + button("people.hire(people.fellow)","Hire")
  + button("people.hire(people.fellow, 10)","Hire 10")  
  + button("people.hire(people.fellow, 100)","Hire 100")  
  + text("Fellows: " + people.fellow.count)  
  + button("people.fire(people.fellow, 100)","Fire 100") 
  + button("people.fire(people.fellow, 10)","Fire 10") 
  + button("people.fire(people.fellow)","Fire") 
  + ln
  + button("people.hire(people.officer)","Hire")
  + button("people.hire(people.officer, 10)","Hire 10")  
  + button("people.hire(people.officer, 100)","Hire 100")  
  + text("Officers: " + people.officer.count)  
  + button("people.fire(people.officer, 100)","Fire 100") 
  + button("people.fire(people.officer, 10)","Fire 10") 
  + button("people.fire(people.officer)","Fire") 
  + ln
  + button("people.hire(people.board)","Hire")
  + button("people.hire(people.board, 10)","Hire 10")  
  + button("people.hire(people.board, 100)","Hire 100")  
  + text("Board Members: " + people.board.count)  
  + button("people.fire(people.board, 100)","Fire 100") 
  + button("people.fire(people.board, 10)","Fire 10") 
  + button("people.fire(people.board)","Fire") 
  + ln 
  + text("Total Employees: " + people.total())
  + ln 
  + text("Desks: " + places.capacity())
  + ln 
  + button("places.upgrade()","Upgrade") 
  + text("Office Location: " + places.rented.name)
  + ln 
  + button("places.buy(places.building)","Buy") 
  + text("Buildings owned: " + places.building.count)
  + button("places.sell(places.building)","Sell") 
  + ln 
  + button("places.buy(places.campus)","Buy") 
  + text("Campuses owned: " + places.campus.count)
  + button("places.sell(places.campus)","Sell") 
  + ln 
  + status;
}

// Control Blocks

var money = new money();
var people = new people();
var places = new places();
var status = "Welcome to Startup";

function money() {
  this.dollars = 0;
  
  this.pay = function(amount, force) {
    if (force || this.dollars >= amount) {
      this.dollars -= amount;
	  return true;
    } else {
        status = "You do not have the $" + amount + " required.";
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
	    status = "Your office is too small to hire this person.";
	  }
    } else {
      status = "You do not have enough oversight to hire this person.";
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
	    status = "You can't fire employees you need.";
	  }
	} else {
	  status = "Nice try, but you can't fire people who don't work for you.";
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
  
  this.officer = new this.hiretype("Corporate Officer",32000,-3200,64000,null,null,10,5,this.vp);
  this.board = new this.hiretype("Board Member",1920000,3200,64000,this.officer,null,10,null,null);
  this.vp = new this.hiretype("Vice President",16000,-1600,32000,null,this.officer,5,5,this.director);
  this.fellow = new this.hiretype("Fellow",960000,1600,32000,this.vp,null,5,null,null);
  this.director = new this.hiretype("Director",8000,-800,16000,null,this.vp,5,5,this.middleman);
  this.middleman = new this.hiretype("Middle Manager",4000,-400,8000,null,this.director,3,5,this.manager);
  this.manager = new this.hiretype("Manager",2000,-200,4000,null,this.middleman,2,25,this.worker);
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
	  status = "You need this space.  Consider firing some workers.";
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
  
  this.rented = this.garage
}
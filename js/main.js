/*
Copyright Brian Cook - © 2014 - All Rights Reserved

TODO:
--CONTROLS:
====custom hire/fire amounts
====additional hire/fire buttons (double, halve, max, tree)
====auto-resolve dependencies option
--FUNCTIONALITY:
====cash per click based on company size
====hide employee types not yet needed
====warnings for actions which will put you in the negative
--FEATURES:
====IPOs (to clear the first building hurdle)
====Stock fluctuations affecting board contentment
====productivity multipliers (new office, contentment, vacation time, ...)
===="branch inward" with top-level staying top level, and promoting up subordinates as needed
====departments (marketing, pr, hr, r&d, ...) (create departments one at a time as desired, hire/fire within)
====takeovers of competing companies (other companies grow organically, purchaseable)
====lobbying
====upgrades (infrastructure, patents.. late game speed is appropriate, but early game would be slow)
--GUI:
====figure out where to put status messages
====cash and revenue colors for pos/neg
*/

// main loop

window.setInterval(interval,2000);

function interval() {
  if (money.dollars < 0) {
    money.dollars = Math.floor(money.dollars * 1.001)
  }
  money.earn(people.earnings());
  money.pay(places.rent(), true);
  display.status.age();
  display.refresh();
}

// Control Blocks

var money = new money();
var people = new people();
var places = new places();
var display = new display();

// display
function display() {
  this.person = function(type) {
    return "<div id='" + type.name + "' class='employee box'>"
           + "<img src='images/people/" + type.img + "' class='portrait' />"
           + "<div class='name'>" + type.name + "</div>"
           + "<div class='cost'>Cost: " + type.hire + "</div>"
           + "<div id='" + type.shortname + "count'class='count'>" + type.count + "</div>"
           + this.hirefire(type.iname) + "</div>";
  }

  this.button = function(type, action, label) {
    return "<a href='javascript:" + action + ";display.refresh();' class='" + type + " button'>" + label + "</a>";
  }

  this.hirefire = function(type) {
    return "<div class='hire'>"
           + this.button("hire","people.hire(people." + type + ")","+ 1")
           + this.button("hire","people.hire(people." + type + ", 10)","+ 10")  
           + this.button("hire","people.hire(people." + type + ", 100)","+ 100")
           + this.button("hire","people.hire(people." + type + ", 1000)","+ 1000")
           + "</div><div class='fire'>"
           + this.button("fire","people.fire(people." + type + ")","- 1")
           + this.button("fire","people.fire(people." + type + ", 10)","- 10")  
           + this.button("fire","people.fire(people." + type + ", 100)","- 100")
           + this.button("fire","people.fire(people." + type + ", 1000)","- 1000")
           + "</div>"
  }

  this.init = function() {
    document.getElementById("top").innerHTML = "<table width='100%' height='100%'><tr><td valign='middle'><div id='body'>"
    + "<div id='employees'>"
    + this.person(people.worker)
    + this.person(people.manager)
    + this.person(people.middleman)
    + this.person(people.director)
    + this.person(people.vp)
    + this.person(people.fellow)
    + this.person(people.officer)
    + this.person(people.board)
    + "</div><div id='interactive'><div id='loc' class='box'>"
    + "<div id='locname'>Office Location: <span id='location'>Your Garage</span></div>"
    + "<div id='buildings'>Buildings: <span id='bcount'>0</span>"
    + this.button(null,"places.buy(places.building)","Buy") 
    + this.button(null,"places.sell(places.building)","Sell")
    + "</div><div id='campuses'>Campuses: <span id='ccount'>0</span>"
    + this.button(null,"places.buy(places.campus)","Buy") 
    + this.button(null,"places.sell(places.campus)","Sell") 
    + "</div><div class='cap'>Capacity: <span id='capcount'>0 / 5</span></div>"
    + "<div class='rent'>Rent: $<span id='rentamt'>0</span></div>"
    + "<div class='income'>Revenue: $<span id='revenue'>0</span></div>"
    + "<div id='upgrade'>" + this.button(null,"places.upgrade()","Upgrade") + "Cost: $<span id='upgradeamt'>400</span></div></div>"
    + "<div id='moneys'>$" + money.dollars + "</div>"
    + "<div class='coin'><img src='images/coin.png' onclick='money.earn(100);display.refresh()' /></div>"
    + "</div><div class='bar box'>"
    + "<div id='status'>" + this.status.get() + "</div>"
    + "<div id='calendar'>" + this.status.date() + "</div>"
    + "</div></div></td></tr></table>";
  }

  this.setbg = function(src) {
    document.getElementById("body").style.background = "url('images/places/" + src + "')";
  }
  
  this.locswitch = function() {
    document.getElementById("locname").style.display = "none";
    document.getElementById("buildings").style.display = "block";
    document.getElementById("campuses").style.display = "block";
    document.getElementById("upgrade").innerHTML = "Cost: $<span id='upgradeamt'>81,000,000</span>";
  }

  this.refresh = function() {
    document.getElementById("moneys").innerHTML = "$" + money.dollars.toLocaleString();
    document.getElementById("revenue").innerHTML = (people.earnings() - places.rent()).toLocaleString();
    document.getElementById("wcount").innerHTML = people.worker.count.toLocaleString();
    document.getElementById("mcount").innerHTML = people.manager.count.toLocaleString();
    document.getElementById("mmcount").innerHTML = people.middleman.count.toLocaleString();
    document.getElementById("dcount").innerHTML = people.director.count.toLocaleString();
    document.getElementById("vpcount").innerHTML = people.vp.count.toLocaleString();
    document.getElementById("fcount").innerHTML = people.fellow.count.toLocaleString();
    document.getElementById("ocount").innerHTML = people.officer.count.toLocaleString();
    document.getElementById("bmcount").innerHTML = people.board.count.toLocaleString();
    document.getElementById("capcount").innerHTML = people.total().toLocaleString() + " / " + places.capacity().toLocaleString();
    document.getElementById("location").innerHTML = places.rented.name;
    document.getElementById("rentamt").innerHTML = places.rent().toLocaleString();
    document.getElementById("upgradeamt").innerHTML = places.upgrade(true).toLocaleString();
    document.getElementById("bcount").innerHTML = places.building.count.toLocaleString();
    document.getElementById("ccount").innerHTML = places.campus.count.toLocaleString();
    document.getElementById("status").innerHTML = display.status.get();
    document.getElementById("calendar").innerHTML = display.status.date();
  }

  this.status = function() {
    this.message = "Welcome to Startup";
    this.count = 0;
    this.day = 1;
    this.week = 1;
    this.quarter = 1;
    this.year = 2014;
    
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
      this.day += 1;
      if (this.day % 7 == 0 ) {
        this.week += 1;
      }
      if (this.day % 91 == 0 ) {
        this.quarter = (this.quarter + 1) % 4 + 1;
      }
      if (this.day % 365 == 0 ) {
        this.year += 1;
      }
      if (this.count++ > 3) {
        this.count = 0;
        this.message = "";
      }
    }
    
    this.date = function() {
      return "Day " + this.day + ", W" + this.week + " Q" + this.quarter + " " + this.year;
    }
  }
  
  this.status = new this.status();
}

function money() {
  this.dollars = 0;
  
  this.pay = function(amount, force) {
    if (force || this.dollars >= amount) {
      this.dollars -= amount;
	    return true;
    } else {
      display.status.set("You do not have the $" + amount + " required.");
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
    if (type.superior && type.count + count > type.superior.count * type.superior.sigma) {
      display.status.set("You do not have enough oversight to hire this person.");
      return false;
    }
    if (type.limiter && type.count + count > type.limiter.count) {
      display.status.set("You need a larger company to hire this person.");
      return false;
    }
    if (people.total() + count * type.space > places.capacity()) {
      display.status.set("You need more office space to hire this person.");
      return false;
    }
    if (money.pay(type.hire * count)) {
      type.count += count;
    }
  }
  
  this.fire = function(type, count) {
    count = count || 1;
    if (type.count - count < 0) {
	    display.status.set("You can't fire people who don't work for you.");
      return false;
    }
    if (type == this.officer && type.count - count < this.board.count) {
	    display.status.set("You can't have more board members than officers.");
      return false;
    } 
    if (type == this.vp && type.count - count < this.fellow.count) {
	    display.status.set("You can't have more fellows than VPs.");
      return false;
    } 
    if (type.subordinate && (type.count - count) * type.sigma < type.subordinate.count) {
	    display.status.set("You can't fire critical management.");
      return false;
    } 
    if (money.pay(type.fire * count)) {
	    type.count -= count;
	  }
  }
  
  this.hiretype = function(name,iname,shortname,hire,earn,fire,limiter,superior,space,sigma,subordinate,img) {
    this.name = name;
	  this.iname = iname;
	  this.shortname = shortname;
    this.hire = hire;
	  this.earn = earn;
	  this.fire = fire;
	  this.count = 0;
	  this.limiter = limiter;
	  this.superior = superior;
	  this.space = space;
	  this.sigma = sigma;
	  this.subordinate = subordinate;
	  this.img = img;
	  this.size = function() {
	    return this.count * this.space;
	  }
  }
  
  this.officer = new this.hiretype("Chief Officer","officer","o",32000,-3200,64000,null,null,10,4,this.vp,"officer.png");
  this.board = new this.hiretype("Board Member","board","bm",1920000,32000,64000,this.officer,null,10,null,null,"board.png");
  this.vp = new this.hiretype("Vice President","vp","vp",16000,-1600,32000,null,this.officer,5,4,this.director,"vp.png");
  this.fellow = new this.hiretype("Fellow","fellow","f",960000,16000,32000,this.vp,null,5,null,null,"fellow.png");
  this.director = new this.hiretype("Director","director","d",8000,-800,16000,null,this.vp,5,4,this.middleman,"director.png");
  this.middleman = new this.hiretype("Upper Mgmt.","middleman","mm",4000,-400,8000,null,this.director,3,4,this.manager,"middleman.png");
  this.manager = new this.hiretype("Manager","manager","m",2000,-200,4000,null,this.middleman,2,20,this.worker,"manager.png");
  this.worker = new this.hiretype("Worker","worker","w",1000,100,2000,null,this.manager,1,null,null,"worker.png");
}

function places() {
  this.capacity = function() {
    return this.rented.size + this.building.count * this.building.size + this.campus.count * this.campus.size;
  }
  
  this.rent = function() {
    return this.rented.rent + this.building.count * this.building.upkeep + this.campus.count * this.campus.upkeep;
  }
  
  this.upgrade = function(getcost) {
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
	  if (getcost) {
	    if (this.upgradeto == this.none) {
	      return this.building.cost;
	    } 
	    else {
	      return this.upgradeto.rent;
	    }
	  } 
	  else if (this.upgradeto == this.none) {
	    if (money.pay(this.building.cost)) {
	      this.rented = this.none;
		  this.building.count += 1;
	  	display.setbg(this.building.img);
	  	display.locswitch();
	    }
	  } else if (money.pay(this.upgradeto.rent)) {
	    this.rented = this.upgradeto;
	    display.setbg(this.upgradeto.img);
	  } 
  }
  
  this.buy = function(type) {
    if (money.pay(type.cost)) {
	    type.count += 1;
	    if (type == this.campus && type.count ==1) {
	      display.setbg(type.img);
	    }
	  } 
  }
  
  this.sell = function(type) {
    if (places.capacity() - type.size >= people.total()) {
	    money.earn(type.cost/2);
	    type.count--;
	  } else {
	    display.status.set("You need this space.  Consider firing some workers.");
	  }
  }
  
  this.renttype = function(name,size,rent,img) {
    this.name = name;
    this.size = size;
    this.rent = rent;
	  this.img = img;
  }
  
  this.none = new this.renttype("Nothing",0,0,null);
  this.garage = new this.renttype("Your Garage",5,0,"garage.png");
  this.loft = new this.renttype("A Grungy Loft",30,400,"loft.png");
  this.suite = new this.renttype("A Cramped Office Suite",100,2000,"suite.png");
  this.office = new this.renttype("A Modest Office",400,10000,"office.png");
  this.onestory = new this.renttype("One Floor of an Office Building",1000,30000,"onestory.png");
  this.twostory = new this.renttype("Two Floors of an Office Building",2000,60000,"twostory.png");
  this.threestory = new this.renttype("Three Floors of an Office Building",3000,90000,"threestory.png");
  this.fourstory = new this.renttype("Four Floors of an Office Building",4000,120000,"fourstory.png");
  this.fivestory = new this.renttype("Five Floors of an Office Building",5000,150000,"fivestory.png");
  
  this.owntype = function(size,cost,upkeep,img) {
    this.size = size;
    this.cost = cost;
    this.upkeep = upkeep;
	  this.count = 0;
	  this.img = img;
  }
  
  this.building = new this.owntype(5000,81000000,15000,"building.png");
  this.campus = new this.owntype(25000,324000000,60000,"campus.png");
  
  this.rented = this.garage;
}
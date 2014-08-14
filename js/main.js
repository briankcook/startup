/*
Copyright Brian Cook - © 2014 - All Rights Reserved

TODO:
--CONTROLS:
====custom hire/fire amounts
====additional hire/fire buttons (double, halve, max, tree)
====auto-resolve dependencies option
--FEATURES:
====productivity multipliers (new office, contentment, vacation time, ...)
===="branch inward" with top-level staying top level, and promoting up subordinates as needed
====departments (marketing, pr, hr, r&d, ...) (create departments one at a time as desired, hire/fire within)
====lawyers and lawsuits and patents(1/100000 chance per employee per day, higher for fellows, researchers)
====takeovers of competing companies (other companies grow organically, purchaseable)
====lobbying
====upgrades (infrastructure, patents.. late game speed is appropriate, but early game would be slow)
====disableable game-pausing popups for special opportunities (to promote playing over idling)
--GUI:
====cash and revenue colors for pos/neg

--STOCK:
step two: IPO.  2-25% of company is sold for 50% of valuation.
step three: trading.  instead of valuation, stock price is shown.  elements of randomness
step four: sell-offs.  sell fractions of the company for additional capital
step five: stock splitting
step maybe: board of trustees controlling how company is run

http://jsfiddle.net/4h17cjb5/
*/

// main loop

window.setInterval(interval,2000);

var PAUSED = false;

function interval() {
  if (PAUSED) { return; }
  if (money.dollars < 0) {
    money.dollars = Math.floor(money.dollars * 1.001)
  }
  tmp = money.dollars;
  money.earn(people.earnings());
  money.pay(places.rent(), true);
  money.quarterly += (money.dollars - tmp);
  people.worker.mature();
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

  this.button = function(id, type, action, label) {
    return "<a id='" + id + "' href='javascript:" + action + ";display.refresh();' class='" + type + " button'>" + label + "</a>";
  }

  this.hirefire = function(type) {
    return "<div class='hire'>"
           + this.button(type + "hire1","hire","people.hire(people." + type + ")","<span class='fixedwidth'>+</span> 1")
           + this.button(type + "hire10","hire","people.hire(people." + type + ", 10)","<span class='fixedwidth'>+</span> 10")  
           + this.button(type + "hire100","hire","people.hire(people." + type + ", 100)","<span class='fixedwidth'>+</span> 100")
           + this.button(type + "hire1000","hire","people.hire(people." + type + ", 1000)","<span class='fixedwidth'>+</span> 1000")
           + "</div><div class='fire'>"
           + this.button(type + "fire1","fire","people.fire(people." + type + ")","<span class='fixedwidth'>-</span> 1")
           + this.button(type + "fire10","fire","people.fire(people." + type + ", 10)","<span class='fixedwidth'>-</span> 10")  
           + this.button(type + "fire100","fire","people.fire(people." + type + ", 100)","<span class='fixedwidth'>-</span> 100")
           + this.button(type + "fire1000","fire","people.fire(people." + type + ", 1000)","<span class='fixedwidth'>-</span> 1000")
           + "</div>"
  }

  this.init = function() {
    document.body.innerHTML = "<table width='100%' height='100%'><tr><td valign='middle'><div id='body'>"
    + "<div id='employees'>"
      + this.person(people.worker)
      + this.person(people.manager)
      + this.person(people.middleman)
      + this.person(people.director)
      + this.person(people.vp)
      + this.person(people.fellow)
      + this.person(people.officer)
      + this.person(people.board)
    + "</div>"
    + "<div id='interactive'>"
      + "<div id='info' class='box'>"
        + "<div class='pause' onclick='display.modal(\"Paused\",\"Resume\")'><img src='images/pause.png' /></div>"
        + "<div id='locname'>Office Location: <span id='location'>Your Garage</span></div>"
        + "<div id='buildings'>Buildings: <span id='bcount'>0</span>"
          + this.button(null,null,"places.buy(places.building)","Buy") 
          + this.button(null,null,"places.sell(places.building)","Sell")
        + "</div>"
        + "<div id='campuses'>Campuses: <span id='ccount'>0</span>"
          + this.button(null,null,"places.buy(places.campus)","Buy") 
          + this.button(null,null,"places.sell(places.campus)","Sell") 
        + "</div>"
        + "<div class='cap'>Capacity: <span id='capcount'>0 / 5</span></div>"
        + "<div class='rent'>Rent: $<span id='rentamt'>0</span></div>"
        + "<div class='income'>Revenue: $<span id='revenue'>0</span></div>"
        + "<div id='upgrade'>" + this.button(null,null,"places.upgrade()","Upgrade") + "Cost: $<span id='upgradeamt'>400</span></div>"
        + "<div class='trainees'>Trainees: <span id='trainees'>0</span></div>"
        + "<div class='productivity'>Productivity: <span id='productivity'>100</span>%</div>"
        + "<div class='valuation'>Valuation: $<span id='valuation'>...</span></div>"
        + "<div class='ipo'>" + this.button("ipo",null,"money.ipo()","Go Public") + "</div>"
      + "</div>"
      + "<div id='moneys'>$" + money.dollars + "</div>"
      + "<div class='coin'><img src='images/coin.png' onclick='money.coin()' /></div>"
    + "</div>"
    + "<div class='bar box'>"
      + "<div id='status'>" + this.status.get() + "</div>"
      + "<div id='calendar'>" + this.status.date() + "</div>"
    + "</div>"
    + "</div></td></tr></table>"
    + "<div id='overlay'></div>"
    + "<div id='modal' class='lightbox'>"
      + "<div id='innermodal'></div>"
      + "<div id='modalbutton1' onclick='display.modalout(true);' class='box modalbutton'></div>"
      + "<div id='modalbutton2' onclick='display.modalout(false);' class='box modalbutton'></div>"
    + "</div>";
    this.enable(people.worker.name);
    this.enablea(people.worker.iname + "hire1");
    this.enablea(people.worker.iname + "fire1");
  }
  
  this.modal = function(contents, button1, button2) {
    PAUSED = true;
    document.getElementById('innermodal').innerHTML = contents;
    document.getElementById('modalbutton1').innerHTML = button1;
    document.getElementById('modalbutton2').innerHTML = button2;
    document.getElementById('modalbutton2').style.display = button2 ? "block" : "none";
    document.getElementById('overlay').style.visibility = "visible";
    m = document.getElementById('modal');
    m.style.visibility = "visible";
    m.style.margin = (window.innerHeight / 2 - m.offsetHeight / 2) + "px " + (window.innerWidth / 2 - m.offsetWidth / 2) + "px";
  }
  
  this.modalout = function() {
    document.getElementById('modal').style.visibility = "hidden";
    document.getElementById('overlay').style.visibility = "hidden";
    PAUSED = false;
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
  
  this.enable = function(element) {
    document.getElementById(element).style.display = "block";
  }
  
  this.enablea = function(element) {
    document.getElementById(element).style.display = "inline";
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
    document.getElementById("trainees").innerHTML = people.worker.hired.toLocaleString();
    document.getElementById("productivity").innerHTML = (Math.ceil(people.productivity() * 100)).toLocaleString();
    document.getElementById("valuation").innerHTML = money.value().toLocaleString();
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
        money.valuation[this.quarter] = money.quarterly;
        money.quarterly = 0;
        this.quarter = (this.quarter + 1) % 4;
        if (this.quarter == 0) {
          this.quarter = 4;
        }
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
  this.quarterly = 0;
  this.valuation = [0, 0, 0, 0];
    
  this.project = function() {
    return this.quarterly * (91 / (display.status.day % 91));
  }
    
  this.value = function() {
    if (display.status.year == 2014) {
      return "...";
    }
    return Math.max(0,Math.floor(2000 * (people.worker.count + people.worker.hired)
                                 + places.building.cost * places.building.count
                                 + places.campus.cost * places.campus.count
                                 + money.dollars
                                 + 12 * this.project() 
                                 - 8 * this.valuation[display.status.quarter]));
  }
  
  this.pay = function(amount, force) {
    if (force || this.dollars >= amount) {
      this.dollars -= amount;
	    return true;
    } else {
      display.status.set("You do not have the $" + amount.toLocaleString() + " required.");
      return false;
    }
  }
  
  this.earn = function(amount) {
    this.dollars += amount;
  }
  
  this.coin = function() {
    if (PAUSED) { return; }
    if (people.manager.count == 0) {
      money.earn(100);
    } else {
      mgmt = people.manager.count - people.middleman.count + people.director.count + people.vp.count - people.officer.count;
      money.earn(Math.ceil(100 * mgmt * people.productivity()));
    }
    display.refresh();
  }
}

function people() {
  this.total = function() {
    return this.worker.size() + this.manager.size() + this.middleman.size() + this.director.size()
	     + this.vp.size() + this.fellow.size() + this.officer.size() + this.board.size() 
  }
  
  this.productivity = function() {
    if (people.manager.count > 2) {
      return Math.max(0.5,1 - Math.abs(1 - Math.sqrt(people.worker.count / (people.manager.count * 10))));
    }
    return 1;
  }
  
  this.earnings = function() {
    retval = Math.ceil(this.worker.count * this.worker.earn * this.productivity())
           - this.worker.hired * (this.worker.earn / 2)
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
    if (type.superior && (type == this.worker ? type.count + type.hired : type.count) 
        + count > Math.max(1,type.superior.count) * type.superior.sigma) {
      display.status.set("You do not have enough oversight to hire this person.");
      display.enable(type.superior.name);
      display.enablea(type.superior.iname + "hire1");
      display.enablea(type.superior.iname + "fire1");
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
      if (type == people.worker) {
        type.hired += count;
      } else {
        type.count += count;
      }
      if ((type.hired ? type.hired : 0) + type.count > 10) {
        display.enablea(type.iname + "hire10");
        display.enablea(type.iname + "fire10");
      }
      if ((type.hired ? type.hired : 0) + type.count > 100) {
        display.enablea(type.iname + "hire100");
        display.enablea(type.iname + "fire100");
      }
      if ((type.hired ? type.hired : 0) + type.count > 1000) {
        display.enablea(type.iname + "hire1000");
        display.enablea(type.iname + "fire1000");
      }
    }
  }
  
  this.fire = function(type, count) {
    count = count || 1;
    if ((type == this.worker ? type.count + type.hired : type.count) - count < 0) {
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
      if (type == this.worker && count > type.count) {
        type.hired -= (count - type.count);
        type.count -= type.count;
      } else {
	      type.count -= count;
      }
	  }
  }
  
  this.autohire = function(count) {
    nmanager = 0;
    nmiddleman = 0;
    ndirector = 0;
    nvp = 0;
    nofficer = 0;
    needmore = function(sub, nsub, sup, nsup) {
      return sub.count + nsub > Math.max(1,sup.count + nsup) * sup.sigma;
    }
    while (needmore(this.worker, count, this.manager, nmanager)) { nmanager++ }
    while (needmore(this.manager, nmanager, this.middleman, nmiddleman)) { nmiddleman++ }
    while (needmore(this.middleman, nmiddleman, this.director, ndirector)) { ndirector++ }
    while (needmore(this.director, ndirector, this.vp, nvp)) { nvp++ }
    while (needmore(this.vp, nvp, this.officer, nofficer)) { nofficer++ }
    if (count * this.worker.space + nmanager * this.manager.space
        + nmiddleman * this.middleman.space + ndirector * this.director.space
        + nvp * this.vp.space + nofficer * this.officer.space
        + this.total() > places.capacity()) {
      display.status.set("You don't have enough space for that many.");
      return false;
    }
    if (money.pay(count * this.worker.hire + nmanager * this.manager.hire
                  + nmiddleman * this.middleman.hire + ndirector * this.director.hire
                  + nvp * this.vp.hire + nofficer * this.officer.hire)) {
      this.worker.hired += count;
      this.manager.count += nmanager;
      this.middleman.count += nmiddleman;
      this.director.count += ndirector;
      this.vp.count += nvp;
      this.officer.count += nofficer;
    }
  }
  
  this.hiretype = function(name,iname,shortname,hire,earn,fire,limiter,superior,space,sigma,img) {
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
	  this.img = img;
	  this.size = function() {
	    return (this.count + (this.hired ? this.hired : 0)) * this.space;
	  }
  }
  
  this.officer = new this.hiretype("Chief Officer","officer","o",32000,-3200,64000,null,null,10,4,"officer.png");
  this.board = new this.hiretype("Board Member","board","bm",1920000,32000,64000,this.officer,null,10,null,"board.png");
  this.vp = new this.hiretype("Vice President","vp","vp",16000,-1600,32000,null,this.officer,5,4,"vp.png");
  this.fellow = new this.hiretype("Fellow","fellow","f",960000,16000,32000,this.vp,null,5,null,"fellow.png");
  this.director = new this.hiretype("Director","director","d",8000,-800,16000,null,this.vp,5,4,"director.png");
  this.middleman = new this.hiretype("Upper Mgmt.","middleman","mm",4000,-400,8000,null,this.director,3,4,"middleman.png");
  this.manager = new this.hiretype("Manager","manager","m",2000,-200,4000,null,this.middleman,2,20,"manager.png");
  this.worker = new this.hiretype("Worker","worker","w",1000,100,2000,null,this.manager,1,null,"worker.png");
  
  this.officer.subordinate = this.vp;
  this.vp.subordinate = this.director;
  this.director.subordinate = this.middleman;
  this.middleman.subordinate = this.manager;
  this.manager.subordinate = this.worker;
  this.worker.hired = 0;
  
  this.worker.mature = function() {
    amount = 0;
    for ( i = 0 ; i < this.hired ; i++) {
      amount += Math.random() < 0.0476 ? 1 : 0;
    }
    this.hired -= amount;
    this.count += amount;
  }
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
	  } else {
      if (people.earnings() - this.upgradeto.rent > 0 
      || window.confirm("Are you sure?\nYour revenue will be: $" 
                        + (people.earnings() - this.upgradeto.rent).toLocaleString())) {
        if (money.pay(this.upgradeto.rent)) {
          this.rented = this.upgradeto;
          display.setbg(this.upgradeto.img);
        }
      }
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
  this.loft = new this.renttype("A Grungy Loft",40,400,"loft.png");
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
  
  this.building = new this.owntype(10000,121000000,30000,"building.png");
  this.campus = new this.owntype(50000,535000000,15000,"campus.png");
  
  this.rented = this.garage;
}
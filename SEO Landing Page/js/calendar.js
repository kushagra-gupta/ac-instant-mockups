/**
 * Calendar Script
 * Creates a calendar widget which can be used to select the date more easily than using just a text box
 * http://www.openjs.com/scripts/ui/calendar/
 *
 * Example:
 * <input type="text" name="date" id="date" />
 * <script type="text/javascript">
 * 		calendar.set("date");
 * </script>
 */
calendar = {
	month_names: ["January","February","March","April","May","June","July","August","September","October","November","December"],
	weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	month_days: [31,28,31,30,31,30,31,31,30,31,30,31],
	//Get today's date - year, month, day and date
	today : new Date(),
	opt : {},
	data: [],
	calendar_instance : {},

	//Functions
	/// Used to create HTML in a optimized way.
	wrt:function(txt) {
		this.data.push(txt);
	},

	/* Inspired by http://www.quirksmode.org/dom/getstyles.html */
	getStyle: function(ele, property){
		if (ele.currentStyle) {
			var alt_property_name = property.replace(/\-(\w)/g,function(m,c){return c.toUpperCase();});//background-color becomes backgroundColor
			var value = ele.currentStyle[property]||ele.currentStyle[alt_property_name];

		} else if (window.getComputedStyle) {
			property = property.replace(/([A-Z])/g,"-$1").toLowerCase();//backgroundColor becomes background-color

			var value = document.defaultView.getComputedStyle(ele,null).getPropertyValue(property);
		}

		//Some properties are special cases
		if(property == "opacity" && ele.filter) value = (parseFloat( ele.filter.match(/opacity\=([^)]*)/)[1] ) / 100);
		else if(property == "width" && isNaN(value)) value = ele.clientWidth || ele.offsetWidth;
		else if(property == "height" && isNaN(value)) value = ele.clientHeight || ele.offsetHeight;
		return value;
	},
	getPosition:function(ele) {
		var x = 0;
		var y = 0;
		while (ele) {
			x += ele.offsetLeft;
			y += ele.offsetTop;
			ele = ele.offsetParent;
		}
		if (navigator.userAgent.indexOf("Mac") != -1 && typeof document.body.leftMargin != "undefined") {
			x += document.body.leftMargin;
			offsetTop += document.body.topMargin;
		}

		var xy = new Array(x,y);
		return xy;
	},
	/// Called when the user clicks on a date in the calendar.
	selectDate:function(year,month,day) {
		var ths = _calendar_active_instance;
		if(ths.opt['onDateSelect']) ths.opt['onDateSelect'].apply(ths, [year,month,day]); // Custom handler if the user wants it that way.
		else {
			document.getElementById(ths.opt["input"]).value = year + "-" + month + "-" + day; // Date format is :HARDCODE:
			ths.hideCalendar();
		}
	},
	/// Creates a calendar with the date given in the argument as the selected date.
	makeCalendar:function(input_id, year, month, day) {
		year = parseInt(year);
		month= parseInt(month);
		day	 = parseInt(day);

		//Display the table
		var next_month = month+1;
		var next_month_year = year;
		if(next_month>=12) {
			next_month = 0;
			next_month_year++;
		}

		var previous_month = month-1;
		var previous_month_year = year;
		if(previous_month< 0) {
			previous_month = 11;
			previous_month_year--;
		}

    var currentDate = new Date();

		this.wrt("<table cellspacing='5' cellpadding='5'>");
		this.wrt("<tr><th>");
    if( !(month <= currentDate.getMonth() && year <= currentDate.getFullYear())) {
      this.wrt("<a class='prev-month' href='javascript:calendar.makeCalendar(\""+ input_id + "\"," +(previous_month_year)+","+(previous_month)+");' title='"+this.month_names[previous_month]+" "+(previous_month_year)+"'><i class='ac-icon ac-1x arrow-left'></i><span class='prev-month-name'>" + this.month_names[previous_month].substr(0, 3) + "</span></a>");
    }
    this.wrt("</th>");
		this.wrt("<th colspan='5' class='calendar-title'><div class='current-title'><span class='current-month-name'>" + this.month_names[month] + "</span><i class='ac-icon ac-1x arrow-down ac-w'></i><ul name='calendar-month-list' class='calendar-month-list' onClick='calendar.makeCalendar(\""+ input_id + "\","+year+",this.value);'>");
		for(var i in this.month_names) {
      if(i >= month) {
        this.wrt("<li class='month-item' value='"+i+"'><span class='month-name'>"+this.month_names[i]+"</span><span class='month-year'>" + year + "</span></li>");
  			//if(i == month) this.wrt(" selected='selected'");
  			//this.wrt(">);
      }
		}
		this.wrt("</ul></div></th>");
		this.wrt("<th><a class='next-month' href='javascript:calendar.makeCalendar(\""+ input_id + "\"," +(next_month_year)+","+(next_month)+");' title='"+this.month_names[next_month]+" "+(next_month_year)+"'><span class='next-month-name'>" + this.month_names[next_month].substr(0, 3) + "</span><i class='ac-icon ac-1x arrow-right'></i></a></th></tr>");
		this.wrt("<tr class='header'>");
		for(var weekday=0; weekday<7; weekday++) this.wrt("<td>"+this.weekdays[weekday]+"</td>");
		this.wrt("</tr>");

		//Get the first day of this month
		var first_day = new Date(year,month,1);
		var start_day = first_day.getDay();

		var d = 1;
		var flag = 0;

		//Leap year support
		if(year % 4 == 0) this.month_days[1] = 29;
		else this.month_days[1] = 28;

		var days_in_this_month = this.month_days[month];

		//Create the calender
		for(var i=0;i<=5;i++) {
			if(w >= days_in_this_month) break;
			this.wrt("<tr>");
			for(var j=0;j<7;j++) {
				if(d > days_in_this_month) flag=0; //If the days has overshooted the number of days in this month, stop writing
				else if(j >= start_day && !flag) flag=1;//If the first day of this month has come, start the date writing

				if(flag) {
					var w = d, mon = month+1;
					if(w < 10)	w	= "0" + w;
					if(mon < 10)mon = "0" + mon;

					//Is it today?
					var class_name = '';
					var yea = this.today.getYear();
					if(yea < 1900) yea += 1900;

					if(yea == year && this.today.getMonth() == month && this.today.getDate() == d) class_name = " today";
					if(day == d) class_name += " selected";

					class_name += " " + this.weekdays[j].toLowerCase();

					this.wrt("<td class='days"+class_name+"'><a class='calendar-grid' href='javascript:calendar.selectDate(\""+year+"\",\""+mon+"\",\""+w+"\")'><div class='calendar-date'>"+w+"</div><div class='select-departure-text'>Select</div><div class='calendar-date-price'><sup>$</sup>545</div><div class='calendar-price-terms'>One-way/pp</div></a></td>");
					d++;
				} else {
					this.wrt("<td class='days'>&nbsp;</td>");
				}
			}
			this.wrt("</tr>");
		}
		this.wrt("</table>");

		document.getElementById(input_id).innerHTML = this.data.join("");
		this.data = [];
	},

	/// Display the calendar - if a date exists in the input box, that will be selected in the calendar.
	showCalendar: function() {
		var input = document.getElementById(this.opt['input']);

		//Position the div in the correct location...
		var div = document.getElementById(this.opt['input']);

		if(this.opt['display_element']) var display_element = document.getElementById(this.opt['display_element']);
		else var display_element = document.getElementById(this.opt['input']);

		var xy = this.getPosition(display_element);
		var width = parseInt(this.getStyle(display_element,'width'));
		// div.style.left=(xy[0]+width+10)+"px";
		// div.style.top=xy[1]+"px";

		// Show the calendar with the date in the input as the selected date
		var existing_date = new Date();
		var date_in_input = input.value;
		if(date_in_input) {
			var selected_date = false;
			var date_parts = date_in_input.split("-");
			if(date_parts.length == 3) {
				date_parts[1]--; //Month starts with 0
				selected_date = new Date(date_parts[0], date_parts[1], date_parts[2]);
			}
			if(selected_date && !isNaN(selected_date.getYear())) { //Valid date.
				existing_date = selected_date;
			}
		}

		var the_year = existing_date.getYear();
		if(the_year < 1900) the_year += 1900;
		this.makeCalendar(this.opt['input'], the_year, existing_date.getMonth(), existing_date.getDate());
		document.getElementById(this.opt['input']).style.display = "block";
		_calendar_active_instance = this;
	},

	/// Hides the currently show calendar.
	hideCalendar: function(instance) {
		var active_calendar_id = "";
		if(instance) active_calendar_id = instance.opt['input'];
		else active_calendar_id = _calendar_active_instance.opt['input'];

		if(active_calendar_id) document.getElementById(active_calendar_id).style.display = "none";
		_calendar_active_instance = {};
	},

	/// Setup a text input box to be a calendar box.
	set: function(input_id, opt) {
		var input = document.getElementById(input_id);
		if(!input) return; //If the input field is not there, exit.
    this.opt = {};
		if(opt) this.opt = opt;

		if( this.calendar_instance[input_id] ) this.opt = this.calendar_instance[input_id];

		if(!this.opt['calendar']) this.init(input_id);

		var ths = this;
		if(this.opt['onclick'])
      input.onclick=this.opt['onclick'];
		else {
      ths.opt['input'] = input_id;
			ths.calendar_instance[input_id] = ths.opt;
      ths.showCalendar();
      ths.opt = {};
		}
	},

	/// Will be called once when the first input is set.
	init: function(input_id) {
		if(!this.opt['calendar'] || !document.getElementById(this.opt['calendar'])) {
			var div = document.createElement('div');
			if(!this.opt['calendar']) this.opt['calendar'] = 'calender_div_'+ Math.round(Math.random() * 100);

			div.setAttribute('id',this.opt['calendar']);
			div.className="calendar-box";

			document.getElementById(input_id).appendChild(div);
		}
	}
}

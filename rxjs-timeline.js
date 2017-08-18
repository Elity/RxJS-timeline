/*
代码来自http://www.hubwiz.com/class/569d92e3acf9a45a69b05154

TimelineCanvas - 基于Canvas实现
TimelineDOM - 基于DOM实现
实例化

两个类具有相同形式的构造函数，传入一个标识字符串即可：

var t1 = new TimelineCanvas("demo1");
var t2 = new TimelineDOM("demo2");
方法调用

两个类都提供了三个方法，可以在观测者的接口函数内直接调用：

Rx.Observable.of(1,2,3)
    .subscribe(
        function(d){ t1.next(d);  t2.next(d); },
        function(e){ t1.error(e); t2.error(e);},
        function(){ t1.completed();t2.completed();}
    );
区别与应用场景

在TimelineCanvas中，新的数据从右侧进入，向左侧实时移动。而在 TimelineDOM中则没有动画效果，仅仅是将新的数据放置在前一个数据 的右侧。

对于error()调用，TimelineCanvas会立刻停止动画，并以红色背景 标示错误；而TimelineDOM则在数据末尾添加一个红色的X记号。

对于completed()调用，TimelineCanvas会立刻停止动画，并以绿色 背景标示结束；而TimelineDOM则在数据末尾添加一个绿色的|记号。

如果一个可观测序列的各数据之间有明显的时间区隔，那么适合使用 TimelineCanvas；否则应当使用TimelineDOM来表现各数据之间的 先后顺序。

*/

(function(){
	let s = document.createElement('style');
	s.innerHTML = `
.timeline{
	background: black;
	color: white;
	padding: 10px 0px;
	font-family: Consolas;
	font-size: 12px;
	margin: 5px 0px;
	position:relative;
	height:14px;
}
.timeline .label{
	position:absolute;
	right: 0px;
	top: 0px;
	font-family: Verdana;
	font-size: 20px;
	color: #777;
	padding-right:10px;
}
.timeline .host{
	position:absolute;
}
.emit{
	padding: 0 5px;
	background: #337ab7;
	text-align: center;
	border-radius: 10px;
	margin:0 5px;
}
.completed{
	border-left: 5px solid #0f0;
	padding: 0 5px;
	margin: 0 5px;
}
.error:before{
	content: "X";
	padding: 0 5px;
	margin: 0 5px;
	color: #f00;
}
	`
	document.head.appendChild(s);
})();

//DOM implementation
var TimelineDOM = (function(){
  var Timeline = function(id){
	this._id = id;
    var el =  this._root = document.createElement("div");
	el.classList.add("timeline");
	el.setAttribute("id",id);
	var label = document.createElement("div");
	label.classList.add("label");
	label.innerHTML = id;
	el.appendChild(label);
	var host = this._host = document.createElement("div");
	host.classList.add("host");
	//host.innerHTML = "&nbsp;";
	el.appendChild(host);
	document.body.appendChild(el);
  };
  Timeline.prototype.next = function(data){
    var el = document.createElement("span");
	el.classList.add("emit");
	el.textContent = data;
	this._host.appendChild(el);        	
	//make it visible
	while(true){
		var right = el.offsetLeft + el.offsetWidth;
		var rightLimit = this._root.offsetWidth;
		//console.log([right,rightLimit]);
		if(right > rightLimit && this._host.childNodes.length > 1) 
			this._host.childNodes[0].remove();
		else break;
	}
  };
  Timeline.prototype.completed = function(){
    var el = document.createElement("span");
	el.classList.add("completed");
	this._host.appendChild(el);
  };
  Timeline.prototype.error = function(err){
    var el = document.createElement("span");
	el.classList.add("error");
	this._host.appendChild(el);
  };
  return Timeline;
})();
//canvas implementation
var TimelineCanvas = (function(){
  var Timeline = function(id){
    this._id = id;
    this._width = document.body.offsetWidth;
    this._height = 34;
    var canvas = document.createElement("canvas");
    canvas.setAttribute("id",id);
    canvas.setAttribute("width",this._width);
    canvas.setAttribute("height",this._height);
    document.body.appendChild(canvas);
    this._ctx = canvas.getContext("2d");
    this._data = [];
    this.startLoop();
  };
  Timeline.prototype.next = function(data){
    this._data.push({
      tick : Date.now(),
      value: data,
    });
    if(this._data.length > 20) this._data.shift();
    return this;
  };
  Timeline.prototype.completed = function(){
    this.stopLoop();
    this._end = true;
    this.render();
  };
  Timeline.prototype.error = function(e){
    this.stopLoop();
    this._error = true;
    this.render();
  }
  Timeline.prototype.render = function(){
    var self = this;
    var base = Date.now();
    this._ctx.fillStyle="black";
    if(this._error) this._ctx.fillStyle="red";
    if(this._end) this._ctx.fillStyle="green";
    this._ctx.fillRect(0,0,this._width,this._height);
    this._ctx.font = "20px Verdana";
    this._ctx.textAlign = "start";
    this._ctx.fillStyle = "#777";
    this._ctx.fillText(this._id,10,20);
    for(var i=this._data.length-1;i>=0;i--){
      var d = this._data[i];
      var x = (base - d.tick)*50/1000 + 10;
      x = this._width - x;
      var y = 10;
      with(self._ctx){
        beginPath();
        arc(x,y,5,0,2*Math.PI);fillStyle="white";fill();
        font = "12px Consolas";textAlign="end"; fillText(d.value,x,y+20);
      }
    }
  };
  Timeline.prototype.startLoop = function(){
    var self = this;
    this._timer = setInterval(function(){
        self.render();
    },20);
  };
  Timeline.prototype.stopLoop = function(){
    clearInterval(this._timer);
  };
  return Timeline;
})();
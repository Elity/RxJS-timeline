# RxJS-timeline
帮助直观理解rxjs的工具
代码来自[汇智网](http://www.hubwiz.com/class/569d92e3acf9a45a69b05154)
------

TimelineCanvas - 基于Canvas实现
TimelineDOM - 基于DOM实现
实例化

两个类具有相同形式的构造函数，传入一个标识字符串即可：
```javascript
var t1 = new TimelineCanvas("demo1");
var t2 = new TimelineDOM("demo2");
```
方法调用

两个类都提供了三个方法，可以在观测者的接口函数内直接调用：

```javascript
Rx.Observable.of(1,2,3)
    .subscribe(
        function(d){ t1.next(d);  t2.next(d); },
        function(e){ t1.error(e); t2.error(e);},
        function(){ t1.completed();t2.completed();}
    );
```
**区别与应用场景**:
>* 在TimelineCanvas中，新的数据从右侧进入，向左侧实时移动。而在 TimelineDOM中则没有动画效果，仅仅是将新的数据放置在前一个数据的右侧。
>* 对于error()调用，TimelineCanvas会立刻停止动画，并以红色背景 标示错误；而TimelineDOM则在数据末尾添加一个红色的X记号。
>* 对于completed()调用，TimelineCanvas会立刻停止动画，并以绿色 背景标示结束；而TimelineDOM则在数据末尾添加一个绿色的|记号。
>* 如果一个可观测序列的各数据之间有明显的时间区隔，那么适合使用 TimelineCanvas；否则应当使用TimelineDOM来表现各数据之间的 先后顺序。
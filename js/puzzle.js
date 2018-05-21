$(document).ready(function() 
{
	//获取canvas
	var canvas = $("#myCanvas").get(0);
	var context = canvas.getContext("2d");

	//每一个方格的边长
	var sideLength = 80;

	//存放所有格子的数组
	var box;

	//保存用户输入的数字
	var n;

	var stepCount = 0;

	//
	var contractAddress = "n1hZdmYUNZYzpzomMt3A1Sz7Z5s4QjfQk4h";
	var NebPay = require("nebpay");
    var nebPay = new NebPay();

	/*
		创建Box类:
		data:格子中的数字
		xPosition,yPosition:格子在画布中的位置
		index:格子在n*n的盒子中的顺序号
		vx,vy:格子当前移动的速度
		distance:格子运动的距离
	*/
	var Box = function(data, x, y, index)
	{
		this.data = data;
		this.xPosition = x * sideLength + 10;
		this.yPosition = y * sideLength + 10;
		this.index = index;
		this.vx = 0;
		this.vy = 0;
		this.distance = 0;
	}

	    //登录
    $("#submit").click(function(event) {
    	var name = $("#loginName").val();
    	var age = $("#loginAge").val();
    	var city = $("#loginCity").val();

    	if (!name) {
    		alert("请输入你的名字!");
    		return;
    	}

    	var callFunction = "register";
		var to = contractAddress;
		var value = 0;
		var callArgs = "[\"" +  name + "\"]"; //in the form of ["args"]
		nebPay.call(to, value, callFunction, callArgs,  {
			listener:cbRegister,
		})
    });

	function cbRegister(resp) {
		var s = JSON.stringify(resp);
        var m = JSON.parse(s);
        if(m == "Error: Transaction rejected by user") {
        	console.log("Transaction rejected by user!");
        } else {
	  		console.log("register:" + JSON.stringify(resp));
			$("#login").hide();
			$("#mainPannel").css({
	    		"-webkit-filter": 'blur(0)'
	       	});
        }
	}

	//cbRegister("");

	$("#localRank").click(function(event) {
		$("#list").empty();
		var callFunction = "getRankOfUser";
		var to = contractAddress;
		var value = 0;
		var callArgs = ""; //in the form of ["args"]

		nebPay.simulateCall(to, value, callFunction, callArgs, {
			listener: cbGetRank,
		})
	});

	$("#globalRank").click(function(event) {
		$("#list").empty();
		var callFunction = "getRankOfAllUsers";
		var to = contractAddress;
		var value = 0;
		var callArgs = ""; //in the form of ["args"]

		nebPay.simulateCall(to, value, callFunction, callArgs, {
			listener: cbGetRank,
		})
	});

	function cbGetRank(resp) {
		var s = JSON.stringify(resp);
        var m = JSON.parse(s);
        var s1 =m.result;
        s1 = JSON.parse(s1);
        var myobj = eval(s1);

        for (var i = 0; i < myobj.length; i++) {
			$("#list").append("<dt class = 'myMessages'>"  + (i + 1) + ". "+ myobj[i].step + "步" + "</dt>");
		}

	}



	//点击开始后从后台获取乱序数组
	$(".submit").click(function()
	{
		n = $(".inputNum")[0].value;

		//
		var callFunction = "start";
		var to = contractAddress;
		var value = 0;
		var callArgs = "[\"" + n + "\"]"

		nebPay.simulateCall(to, value, callFunction, callArgs,  {
			listener:cbGetArray
		})


		box = new Array();
		var  num = {"num" : n};   
		var data = createArr(n * n);

		data = shuffle(data);
		stepCount = 0;
		$("#stepCount").text((stepCount));

			//初始化画布的大小
			canvas.height = parseInt(n) * sideLength + 15;
			canvas.width = parseInt(n) * sideLength + 15;
			var leftWidth = Math.max(270, canvas.width);
			$("#mainPannel").css({
				height: (canvas.height + 220) + 'px',
				width: (leftWidth + 320) + 'px'
			});

			$("#leftPannel").css({
				width: (leftWidth) + 'px',
				opacity: '1'
			});

			$("#history").css({
				height: (canvas.height + 80) + 'px',
				opacity: '1'
			});


			window.addEventListener('keydown', doKeyDown, true);  
	})


	function cbGetArray(resp) {
		var s = JSON.stringify(resp);
        var m = JSON.parse(s);
        var s1 =m.result;
       	s1 = JSON.parse(s1);
        var data = eval(s1);

        console.log(JSON.stringify(data));
		var k = 0;
		for (var i = 0; i < data.length; i++) {
			box.push(new Box(data[i], i % n, Math.floor(i / n), k++));
			console.log("data = " + data[i]);
		}
		createView();  
	}

	/*
		根据box数组的内容，在画布上绘制视图，分四步：
		1.先清除之前的绘图
		2.遍历数组，根据位置坐标的属性绘制视图
		3.判断是否绘制完成（即移动过程是否完成）
		4.判断是否胜利
	*/
	function createView()
	{
		context.clearRect(0, 0, canvas.height, canvas.width);
		for (var i = 0; i < box.length; i++) {
			context.beginPath();

			box[i].xPosition += box[i].vx;
			box[i].yPosition += box[i].vy;
			box[i].distance += box[i].vx;
			box[i].distance += box[i].vy;

			if ((Math.abs(box[i].distance) == sideLength)) 
			{
				clearSpeed(box[i]);
			}

			if(box[i].data == n * n)
			{	
				emptyBox = box[i];
				context.fillStyle = "#C1B3A4";
				context.fillRect(box[i].xPosition, box[i].yPosition, sideLength - 5, sideLength - 5);
			}
			else
			{
				context.fillStyle="#E8DABD";
				context.fillRect(box[i].xPosition, box[i].yPosition, sideLength - 5, sideLength - 5);
				context.fillStyle="#635B52";
				context.font = 'bold 40px arial';
				context.textAlign = "center";
				context.opacity = 0.8;
				context.fillText(box[i].data, box[i].xPosition + 38, box[i].yPosition + 52);
			}
		}

		//如果格子的distance没有被清空,说明格子运动并未终止
		if (emptyBox.distance)
		{
			//重绘视图
			setTimeout(createView, 33);	
		}

		//绘制完成则判断是否胜利
		else{
			if(ifWin())
			{
				if (confirm("恭喜你挑战成功, 是否上传到云端?")) {
					var callFunction = "saveData";
					var to = contractAddress;
					var value = 0;
					var callArgs = "[\"" + stepCount + "\"]"

					nebPay.call(to, value, callFunction, callArgs,  {
						listener:cbSaveData
					})

				} else {

				}
			}
		}

	}

	function cbSaveData(resp) {
		console.log("saved success!");
	}

	//点击画布就去获取鼠标的坐标值，然后处理点击事件
	canvas.onclick = function(e)
	{
		p = getEventPosition(e);		
		bindClick(box, p, context);	
	}

	//键盘事件
	function doKeyDown(e)
	{
		var keyID = e.keyCode ? e.keyCode :e.which; 
		var selectBox;

		//上
		n = parseInt(n);
		if(keyID === 38 )  
		{
			selectBox = findBox(n);
		}

		//下
		if(keyID === 40 )  
		{
			selectBox = findBox(-n);
		}
		//左
		if(keyID === 37 )  
		{
			selectBox = findBox(1);
		}
		//右
		if(keyID === 39)  
		{
			selectBox = findBox(-1);
		}

		if (typeof(selectBox) != "undefined") {
			moveBox(selectBox); 
		}

	}

	//键盘事件发生后，寻找出可以移动的格子，并返回
	function findBox(diff)
	{

		for(var i = 0;i < box.length;i++)
		{
			if((emptyBox.index + diff) == box[i].index)
			{
				return box[i];
			}
		}
		return 0;
	}

	//获取鼠标点击的位置
	function getEventPosition(ev)
	{
		var x, y;
		if (ev.layerX || ev.layerX == 0) 
		{
			x = ev.layerX;
			y = ev.layerY;
		} 
		else if (ev.offsetX || ev.offsetX == 0) 
		{
			x = ev.offsetX;
			y = ev.offsetY;
		}
		return {x: x, y: y};
	}
	 
	//点击事件发生后，寻找点击的格子并处理
	function bindClick(box, p, context)
	{
		for (var i = 0; i < box.length; i++) {
			if (isThisBox(box[i], p)) 
			{
				moveBox(box[i]);
			}
		}
	}

	//根据鼠标的坐标和格子的坐标，寻找出被点击的格子
	function isThisBox(sBox, p)
	{
		if ((sBox.xPosition < p.x)&&((sBox.xPosition + sideLength) > p.x)) 
		{
			if ((sBox.yPosition < p.y)&&((sBox.yPosition + sideLength) > p.y)) 
			{
				return true;
			}
		}

		else
		{
			return false;
		}
	}

	/*
		格子移动的函数：
		1.根据被点击的格子与空格子的距离，判断当前格子能否移动
		2.可以移动时，要交换当前格子和空格子的在盒子中的顺序号
		3.给当前格子和空格子设置速度，开始移动
	*/
	function moveBox(sBox)
	{
		var dx = Math.abs(sBox.xPosition - emptyBox.xPosition);
		var dy = Math.abs(sBox.yPosition - emptyBox.yPosition);

		var distance = Math.sqrt((dx * dx) +(dy * dy));
		if(distance == sideLength)
		{
			var sIndex = sBox.index;
			var eIndex = emptyBox.index;

			sBox.index = eIndex;
			emptyBox.index = sIndex;
			setSpeed(sBox, emptyBox, sBox.xPosition, sBox.yPosition, emptyBox.xPosition, emptyBox.yPosition);

			createView();	
			$("#stepCount").text((++stepCount));	
		}
	}
	/*
		给格子设置速度
		(x1, y1)：起始坐标
		(x2, y2): 目标坐标
	*/
	function setSpeed(sBox , emptyBox ,x1, y1, x2, y2)
	{
		sBox.vx = 10 * (x2 - x1)/sideLength;
		sBox.vy = 10 * (y2 - y1)/sideLength;
		emptyBox.vx = 10 * (x1 - x2)/sideLength;
		emptyBox.vy = 10 * (y1 - y2)/sideLength;
	}

	//速度归零，distancs归零
	function clearSpeed(sBox)
	{
		sBox.vx = 0;
		sBox.vy = 0;
		sBox.distance = 0;
	}

	//判断是否胜利
	function ifWin()
	{
		for(var i = 0;i < box.length;i++) {
			if (box[i].data == 0) {
				continue;
			}

			if(box[i].data != box[i].index + 1) {
				return false;
			}
		}

		return true;
	}

	//tool
	function shuffle(aArr){
    	var iLength = aArr.length,
        i = iLength,
        mTemp,
        iRandom;
 
	    while(i--){
	        if(i !== (iRandom = Math.floor(Math.random() * iLength))){
	            mTemp = aArr[i];
	            aArr[i] = aArr[iRandom];
	            aArr[iRandom] = mTemp;
	        }
	    }
 
    	return aArr;
	}

	function createArr(n){
    	var i = n, aArr = [];
    	while(i--){
        	aArr[i] = i;
    	}
    	return aArr;
	}
})

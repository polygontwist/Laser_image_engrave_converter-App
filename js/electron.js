/* Laser: ImageToGcode APP*/

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
//var elect = require('electron'); 

const electron = require('electron');
const {remote} = electron;
const {dialog, BrowserWindow} = remote;
const fs = require('fs');

var app = require('electron').remote; 

const basepath=process.env.NODE_ENV === 'production' ? remote.app.getAppPath() : __dirname;
//
var basepathDATA="";

var path = require('path');
//path.join(__dirname, 'templates');


var eleWin;

var AppBridge=function(){
	//var path = dialog.showOpenDialog({properties: ['openDirectory']});
	//console.log("elect",electron,fs);
	//console.log("elect",remote.systemPreferences);
	///console.log("elect",remote.process.resourcesPath);
	//console.log("basepath:",basepath);//"D:\elektron\PROSTd_lokal"
		
	//console.log("elect",{properties: ['openDirectory']});
	//console.log("elect",remote.process.platform);//win32
	//console.log("elect",remote.process.title);//C:\WINDOWS\system32\cmd.exe - electron   . //s
	//console.log(elect);
	//readFile(path+"optionen.txt");
	
	var refunction=undefined;
	var zurl="";
		//exists
		//mkdir
		//readdir
	
	var readFile=function(filepath){
		if(fs.existsSync(filepath)){
			fs.readFile(
				filepath, 
				'utf-8', 
				function (err, data) {
					var redata={};
					var sstatus="OK";
//console.log(filepath,data);
					if(err){
					  //alert("An error ocurred reading the file :" + err.message);
					  console.log("!!Error",err.message);
					  var dataERR={"user":"lokal",
								"lastaction":zurl,
								"status":"404:notfound",
								"dat":err.message};
					  sstatus="404:notfound";
					};
						
					if(zurl=="getoptionen"){
						if(sstatus=="404:notfound"){
							redata.dat="{\"tabaktiv\":0}";
							sstatus="OK";
						}
						redata={
							"user":"lokal",
							"dat":JSON.parse(data) ,
							"lastaction":zurl,
							"status":sstatus
						};
						
					}else
					if(zurl=="projektdata"){
						redata=JSON.parse(data);
					}


					if(refunction!=undefined)refunction(JSON.stringify(redata));
					//console.log(sstatus,zurl, data,refunction);
						  
					  
				}
			);
		}
		else{
			var dataERR={"user":"lokal",
								"lastaction":zurl,
								"status":"404:notfound",
								"dat":""};
			if(zurl=="getoptionen"){
				dataERR.dat={"tabaktiv":0};
				dataERR.status="OK";
				}	
			
			console.log("ERROR:filenotexist",JSON.stringify(dataERR));
			if(refunction!=undefined)refunction(JSON.stringify(dataERR));
		}
		
	};
	
	var getFiles=function(myDir,filterend){
		var relist=[];
		var fdirectory=myDir;
		
		if(fdirectory.charCodeAt(fdirectory.length-1)==92){
			//console.log(">",fdirectory.charCodeAt(fdirectory.length-1))
			fdirectory=fdirectory.slice(0,fdirectory.length-1);
			}
		
		var redata=function(err,dir){
			var i,fsdat;
//console.log("getFiles",myDir,dir);
			for(i=0;i<dir.length;i++){
				if(filterend!=""){
					if(dir[i].indexOf(filterend)>0){
						fsdat=fs.lstatSync(myDir+dir[i]);
						relist.push({
							"name":(dir[i].split(filterend)[0]),
							"dat":getformdata(fsdat.mtime)
							});//"2017-12-11 11:11:11"	
					}
				}
				else{
					fsdat=fs.lstatSync(myDir+dir[i]);
					relist.push({"name":dir[i],"dat":getformdata(fsdat.mtime)});//"2017-12-11 11:11:11"
					}
			}
			
			
			var data={"user":"lokal",
				"lastaction":"",
				"status":"OK",
				"dat":relist	//"name":"test","dat":"2017-12-11 11:11:11"	
			}
			//
			if(refunction!=undefined)refunction(JSON.stringify(data));
			else{
				console.log("no refunction",relist);
			}
		};
		
		fs.readdir(fdirectory, redata );
		
	}
	
	var clearfilename=function(sname){
		//sname = decodeURI(sname);
		sname = sname.split(" ").join("");//str_replace(' ', '', $string);
		sname = sname.split("ä").join("ae");//str_replace('ä', 'ae', $string);
		sname = sname.split("ö").join("oe");//str_replace('ö', 'oe', $string);
		sname = sname.split("ü").join("ue");//str_replace('ü', 'ue', $string);
		sname = sname.split("ß").join("ss");//str_replace('ß', 'ss', $string);
		sname = sname.split("Ä").join("ae");//str_replace('Ä', 'ae', $string);
		sname = sname.split("Ö").join("oe");//str_replace('Ö', 'oe', $string);
		sname = sname.split("Ü").join("ue");//str_replace('Ü', 'ue', $string);
		sname = sname.split(".").join("");//str_replace('Ü', 'ue', $string);
		sname = sname.split("$").join("");//str_replace('Ü', 'ue', $string);
		
		//$string = str_replace("%20", "", $string);
		// %...
		
		//$erlaubt = '/[a-z0-9\_\.\-]+/i'; 
		//preg_match_all($erlaubt, $string, $treffer);// "split"
		//$string = implode('', $treffer[0]); 		// "join"
		var match=sname.match(/[a-z0-9\_\.\-]+/i);
		if(match==null){
			sname="file";
		}
		else
			sname=match[0];
		
	 return sname;
	}	
	
	
	//system (loadDataAPP)<->elektron 
	this.DataIO=function(url,daten){
		//console.log("DataIO",globaldata.user,url,getorpost,daten,fs);
		
		//if(basepathDATA=="")return;
		
		zurl=url;
		if(url=="savefile"){//OK:Optionen laden
			//console.log(daten)
			dialog.showSaveDialog(
				{
					defaultPath :basepathDATA+"/"+daten.filename,
					properties: ['openDirectory'],
					filters: [
						{name: 'gcode', extensions: ['gcode']},
						{name: 'All Files', extensions: ['*']}
					  ]
				},
				function (fileName) {
					   if (fileName === undefined){
							//console.log("You didn't save the file");
							alert("Datei nicht gespeichert.");
					   }
					   else{
						   if(fileName.indexOf('.gcode')<0)fileName+='.gcode';
						   console.log("fileName",fileName);
						   fs.writeFileSync(fileName, daten.data,'utf8');
						   
						   alert("Datei "+fileName+" gespeichert.");
					   }
				}
			); 
		}
		
	}

}


var AppeleWin=function(){
	var win=remote.getCurrentWindow();
	//console.log(win.getBounds());
	//win.setSize(900,900);
	
	var ini=function(){
		var userdokumente=app.app.getPath('documents');// C:\Users\andreas\Documents !
		var firststart=false;
		
		//basepathDATA=basepath+"/userData/";
		basepathDATA=userdokumente;
		basepathDATA=path.normalize(basepathDATA);

		
		//console.log("!",fs.readFileSync(basepathDATA+"optionen.txt",'utf-8'));
		
		console.log("basepathDATA",basepathDATA);
		
		
		
		//window.addEventListener('move',resizer );	
		//window.addEventListener('moved',resizer );	
		window.addEventListener('resize',resizer );//TODO
		
		//if(firststart)alert("Deine Daten findest Du unter:\n"+basepathDATA);
	}
	
	var resizer=function(event){
		//console.log(">>",globaldata);
			//mainWindow.webContents.openDevTools()
			var win=remote.getCurrentWindow();
			var bereich=win.getBounds();// x: 279, y: 84, width: 1250, height: 640
			//console.log(bereich);
	}
	

	ini();
}



window.addEventListener('load', function (event) {
		//console.log(">>",globaldata);
		//mainWindow.webContents.openDevTools()
		//app.BrowserWindow
		eleWin=new AppeleWin();
	});
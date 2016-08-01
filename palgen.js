var diff = require('color-diff');
var fs = require('fs');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + Math.floor(min);
}


var white_lab = diff.rgb_to_lab({R:255,G:255,B:255});
var black_lab = diff.rgb_to_lab({R:0,G:0,B:0});

function brightness(c_lab){
	return diff.diff(black_lab,c_lab);
}

function sortPal(pal){
	pal.sort(function(a, b) {
		return brightness(diff.rgb_to_lab(a)) - brightness(diff.rgb_to_lab(b));
	});
}

function populate(pal){
	for (var i=0;i<16;i++){
		pal[i]= { 
					R: getRandomInt(0,256), 
					G: getRandomInt(0,256), 
					B: getRandomInt(0,256) 
				};
	}
}


function score(pal){
	var s = 10000;
	for (var i=0;i<16;i++){
		var c1 = pal[i];
		for (var j=i+1;j<16;j++){
			var c2 = pal[j];
			var candScore = diff.diff(c1,c2);
			if (candScore<s){
				s=candScore;
			}
		}
	}
	return s;
}

function convert(pal){
	var result = [];
	for (var i=0;i<16;i++){
		result.push(diff.rgb_to_lab(pal[i]));
	}
	return result;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(col) {
    return "#" + componentToHex(col.R) + componentToHex(col.G) + componentToHex(col.B);
}

function printPal(score,pal){
	sortPal(pal);
	var s = "[";
	for (var i=0;i<pal.length;i++){
		if (i>0){
			s+=",";
		}

		s+=rgbToHex(pal[i]);		
	}
	s+="]";

	var ft = fileRow.replace(/HEATVAL/g, score);
	ft = ft.replace(/C00/g, rgbToHex(pal[0]));
	ft = ft.replace(/C01/g, rgbToHex(pal[1]));
	ft = ft.replace(/C02/g, rgbToHex(pal[2]));
	ft = ft.replace(/C03/g, rgbToHex(pal[3]));
	ft = ft.replace(/C04/g, rgbToHex(pal[4]));
	ft = ft.replace(/C05/g, rgbToHex(pal[5]));
	ft = ft.replace(/C06/g, rgbToHex(pal[6]));
	ft = ft.replace(/C07/g, rgbToHex(pal[7]));
	ft = ft.replace(/C08/g, rgbToHex(pal[8]));
	ft = ft.replace(/C09/g, rgbToHex(pal[9]));
	ft = ft.replace(/C10/g, rgbToHex(pal[10]));
	ft = ft.replace(/C11/g, rgbToHex(pal[11]));
	ft = ft.replace(/C12/g, rgbToHex(pal[12]));
	ft = ft.replace(/C13/g, rgbToHex(pal[13]));
	ft = ft.replace(/C14/g, rgbToHex(pal[14]));
	ft = ft.replace(/C15/g, rgbToHex(pal[15]));
	curFile += ft;
	var wholefile = curFile+fileFooter;
	fs.writeFileSync("output.html",wholefile);
	return s;
}

function mutate(v,diff){
	return getRandomInt(Math.max(v-diff/2,0),Math.min(v+diff/2,256));
}
function mutatePal(pal,amt){
	var p = pal.slice();
	for (var i=0;i<p.length;i++){
		var c = p[i];
		c.R=mutate(c.R,amt);
		c.G=mutate(c.G,amt);
		c.B=mutate(c.B,amt);
	}
	return p;
}
function run(){
	var pal = [];
	for (var i=0;i<16;i++){
		pal.push(null);
	}

	console.log("initial population");
	var maxScore = 0;//trying to maximize this
	var maxPal = null;
	while(true){
		populate(pal);
		var pal_lab = convert(pal)
		var s = score(pal_lab);
		if (s>maxScore){
			maxScore = s;
			maxPal = pal.slice();
			console.log("new score : "+maxScore)
			console.log("new pal : " +printPal(maxScore,pal));
		}
	}
}


var fileHeader = fs.readFileSync('templateheader.html').toString();
var fileRow = fs.readFileSync('templatebody.html').toString();
var fileFooter = fs.readFileSync('templatefooter.html').toString();
var curFile = fileHeader;

run();


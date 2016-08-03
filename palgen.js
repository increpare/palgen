var diff = require('color-diff');
var fs = require('fs');

function lab_to_xyz (lab) {
	var l = lab.L;
	var a = lab.a;
	var b = lab.b;
	var x;
	var y;
	var z;

	y = (l + 16) / 116;
	x = a / 500 + y;
	z = y - b / 200;

	var y2 = Math.pow(y, 3);
	var x2 = Math.pow(x, 3);
	var z2 = Math.pow(z, 3);
	y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
	x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
	z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

	x *= 95.047;
	y *= 100;
	z *= 108.883;

	return [x, y, z];
};

function xyz_to_rgb(xyz){
	var x = xyz[0] / 100;
	var y = xyz[1] / 100;
	var z = xyz[2] / 100;
	var r;
	var g;
	var b;

	r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
	g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
	b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

	// assume sRGB
	r = r > 0.0031308
		? ((1.055 * Math.pow(r, 1.0 / 2.4)) - 0.055)
		: r * 12.92;

	g = g > 0.0031308
		? ((1.055 * Math.pow(g, 1.0 / 2.4)) - 0.055)
		: g * 12.92;

	b = b > 0.0031308
		? ((1.055 * Math.pow(b, 1.0 / 2.4)) - 0.055)
		: b * 12.92;

	r = Math.min(Math.max(0, r), 1);
	g = Math.min(Math.max(0, g), 1);
	b = Math.min(Math.max(0, b), 1);

	return {R:r * 255,G: g * 255,B: b * 255};
}

function lab_to_rgb (lab){
	return xyz_to_rgb(lab_to_xyz(lab));
}

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
		if (i===0){
			pal[i]={R:0,G:0,B:0};
		} else if (i==15){
			pal[i]={R:255,G:255,B:255};		
		}
		var c = diff.rgb_to_lab(pal[i])
		c['L']=i*100/15;

		pal[i] = lab_to_rgb(c);
		result.push(c);
	}
	return result;
}

function componentToHex(c) {
    var hex = Math.floor(c).toString(16);
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


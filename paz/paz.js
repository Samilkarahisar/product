
function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }

       return(false);
}
String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
} 


var totranslate ="original";

window.onload = function () 
{
var lang ="";
if(getQueryVariable("lang").length >1){
lang = getQueryVariable("lang");
} 
if(totranslate!="original"||lang.length>1){
translation(lang);
}
}



function translation(langparam = "original"){

var language=langparam;

var e = document.getElementById("producttranslate-selectlanguage");

if(e.value.length>1 && e.value !="original"){
	language=e.value;
}


var url = 'https://producttranslate.com/uploads/'+window.location.host+'.json';
console.log(url);

fetch('https://betshare.app/uploads/paz.json', {
    method: 'get'
}).then((response) => {
    return response.json()
  })
  .then((data) => {
	if(language in data[0]){
    data.forEach(element => {
		document.body.innerHTML = document.body.innerHTML.replaceAll(element[totranslate], element[language]);	
   		document.getElementById("producttranslate-selectlanguage").value = language;
    });
    totranslate=language;
	}
  })
}
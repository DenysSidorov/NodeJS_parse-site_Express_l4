/**
 * Created by Denis on 10.11.2016.
 */
var arr=[0,1,1];
var pos=0;
var cnt=0;
var j=0;
var combo=0;
while(true){
    var finder=arr.indexOf(1,pos);
    pos=finder+1;
    if(finder <0){
        break;
    }
    else if(finder>=0){
        cnt++
    }
    console.log(pos+'----'+finder)
}
console.log(cnt);

for(i=0; i<arr.length; i++){
    if(arr[i]==1){
        j++;
    }
    else if(arr[i]==0){
        j=0;
    }
    if(j>1){
        combo++;
    }
    console.log(i+'-----'+arr[i]+'===='+j);
}
console.log(++combo);

var aImg = [
    '/imgs/mm1.jpg',
    '/imgs/mm2.jpg',
    '/imgs/mm3.jpg',
    '/imgs/mm4.jpg',
    '/imgs/mm5.jpg',
    '/imgs/mm6.jpg',
    '/imgs/mm7.jpg',
    '/imgs/mm8.jpg',
    '/imgs/mm9.jpg'    
];

mapLimit(aImg,5,function(url){return loadImageAsync(url)},true);

function mapLimit(list, limit, asyncHandle,allowFail){
    let recursion = (arr) => {
        let finishHandle = () => {
            return arr.length > 0 ? recursion(arr) : 'finish';
        }
        return asyncHandle(arr.shift())
            .then(()=>{
                return finishHandle();
            }).catch((err) => {
                return allowFail ? finishHandle() : err;
            })
    };
    let listCopy = [].concat(list);
    let asyncList = []; // 正在进行的所有并发异步操作
    while(limit--) {
        asyncList.push( recursion(listCopy) ); 
    }
    return Promise.all(asyncList);  // 所有并发异步操作都完成后，本次并发控制迭代完成
}

function loadImageAsync(url){
    return new Promise(function(resolve,reject){
        const img = new Image();
        img.onload = function(){
            resolve(img);
        }
        img.onerror = reject;
        img.src = url;
    });
}

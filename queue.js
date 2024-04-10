

function Queue(concurrency,allowFail){
    this.concurrency = concurrency;
    this.allowFail = allowFail || true;
    this.queue = [];
}

Queue.prototype.push = function(item){
    this.queue.push(item);
}

Queue.prototype.start = function(mapToPromise){
    var self = this;
    return new Promise(function(resolve,reject){
        var completed = 0,
            started = 0,
            running = 0,
            queue = self.queue,
            qLen = queue.length,
            concurrency = self.concurrency,
            results = new Array(qLen);

        //replenish用自执行函数的原因，可以定义和执行一次完成，不用定义一遍，再调用一遍
        //具名自执行函数，方便递归，省
        (function replenish(){
            console.log('count: ', started, completed, qLen)
            if(completed >= qLen){
                return resolve(results);
            }

            while(running < concurrency && started < qLen){
                running++;
                started++;

                // 用匿名函数的原因是，index值保持住
                // 在mapToPromise这个异步过程执行完之后，started已经变化，index不用匿名函数取不到原来的值
                // results[index]再next函数中要根据索引收集顺序执行的promise返回的对应结果
                // 匿名自执行函数，变量保持，闭包，省
                (function(index){
                    var cur = queue[index];
                    var next = function(res){
                        running--;
                        completed++;
                        results[index] = res;
                        replenish();
                    }
                    mapToPromise(cur).then(function(res){
                        next(res);
                    },function(res){
                        if(allowFail){
                           next(res);
                        }
                    })
                    .catch(reject);
                })(started - 1);
            }
        })();
    });
}

var q1 = new Queue(2);
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
aImg.map(t => q1.push(t));

q1.start(loadImageAsync).then(function(results){
    console.log(results)
}).catch(function(err){
    console.log(err)
})


function loadImageAsync(url){
    return new Promise(function(resolve,reject){
        const img = new Image();
        img.onload = function(){
            setTimeout(() => {
                resolve(img);
            }, 1000)  
        }
        img.onerror = reject;
        img.src = url;
    });
}
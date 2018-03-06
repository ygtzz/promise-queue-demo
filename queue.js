

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
        (function replenish(){
            if(completed >= qLen){
                return resolve(results);
            }

            while(running < concurrency && started < qLen){
                running++;
                started++;

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
aImg.forEach(function(item){
    q1.push(item);
});

q1.start(function(item){
    return loadImageAsync(item);
}).then(function(results){
    console.log(results)
}).catch(function(err){
    console.log(err)
})


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
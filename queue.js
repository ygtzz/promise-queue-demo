

function Queue(concurrency,allowFail){
    this.concurrency = concurrency;
    this.allowFail = allowFail || true;
    this.queue = [];
}

Queue.prototype.push = function(promise){
    this.queue.push(promise);
}

Queue.prototype.start = function(){
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
                    cur.call(cur).then(function(res){
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
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png',
    'http://www.qianbao.com/static/pc/img/logo1.png'
];
aImg.forEach(function(item){
    // q1.push(function(){
    //     return new Promise(function(resolve,reject){
    //         setTimeout(function(){
    //             console.log('p' + i +' ' + new Date());
    //             resolve('p' + i);
    //         },2000);
    //     });
    // });
    q1.push(function(){
        return loadImageAsync(item);
    });
});

q1.start().then(function(results){
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
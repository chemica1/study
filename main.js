var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring');
var template = require('./lib/template.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    
    
    if(pathname === '/'){  //메인페이지
          if(queryData.id === undefined){
            fs.readdir('./data', function(error, filelist){
              var title = 'Welcome';
              var description = 'Hello, Node.js';
              var list = template.List(filelist);
              var html = template.HTML(title, list,
                                           `<h2>${title}</h2>${description}`,`<a href="/create">create</a>`);
              response.writeHead(200);
              response.end(html);
            })
          }else{ //컨텐츠를 선택했을때 나오는 부분 사용자가 직접 만든부분이므로 보안민감
            fs.readdir('./data', function(error, filelist){
             var filteredID = path.parse(queryData.id).base;
              fs.readFile(`data/${filteredID}`, 'utf8', function(err, description){
                var title = queryData.id;
                var sanitizedTitle = sanitizeHtml(title);
                var sanitizedDescription = sanitizeHtml(description,{
                    allowedTags : ['h1']
                });
                var list = template.List(filelist);
                var html = template.HTML(title, list,
                                            `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                                            `<a href="/create">create</a>
                                            <a href="/update?id=${sanitizedTitle}">update</a>

                                            <form action="delete_process" method="post">
                                            <input type="hidden" name="id" value="${sanitizedTitle}">
                                            <input type="submit" value="delete">
                                            </form>`);
                response.writeHead(200);
                response.end(html);
              });
            });
          }
    }else if(pathname === '/create'){
         fs.readdir('./data', function(error, filelist){
          var title = '';
          var description = 'create';
          var list = template.List(filelist);
          var html = template.HTML(title, list,
            `
            <form action="/create_process" method="post">
            <p>
            <input type = "text" name="title" placeholder="title">
            </p>

            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>

            <p>
                <input type="submit">
            </p>
            </form>

            <h2>${title}</h2>
            ${description}
          
            `,``);
          response.writeHead(200);
          response.end(html);
        })
    }else if(pathname === '/create_process'){
        var body = '';
        
        request.on('data', function(data){
              body = body + data;
        });
        request.on('end', function(){
              var post = querystring.parse(body);
              var title = post.title;
              var description = post.description;

            fs.writeFile(`data/${title}`, description, 'utf8', function(err){
            response.writeHead(302, {Location: `/?id=${title}`});
            response.end();
            });
    
        });
        
    }else if(pathname === '/update'){  //update버튼 누르면 나오는 부분
       fs.readdir('./data', function(error, filelist){
           var filteredID = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredID}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = template.List(filelist);//도메인 달면 작동안할수도action을 저렇게..  //textarea 태그에 내용은..
            var html = template.HTML(title, list,   `
            <form action="/update_process" method="post"> 
            <input type = "hidden" name='hidden_id' value="${title}">
            <p>
            <input type = "text" name="title" placeholder="title" value="${title}">
            </p>

            <p>
                <textarea name="description" placeholder="description" >${description}</textarea>
            </p>  

            <p>
                <input type="submit">
            </p>
            </form>

            <h2>${title}</h2>
            ${description}
          
            `,``);
                response.writeHead(200);
                response.end(html);
              });
            });
    } else if(pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){
              body = body + data;
        });
        request.on('end', function(){
              var post = querystring.parse(body);
              var hidden_id = post.hidden_id;
              var title = post.title;
              var description = post.description;
           
            fs.rename(`data/${hidden_id}`, `data/${title}`,function(error){
                fs.writeFile(`data/${title}`, description,'utf8',function(error){
                   response.writeHead(302, {Location: `/?id=${title}`});
                   response.end();
                });
            });
        });
    }else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){
              body = body + data;
        });
        request.on('end', function(){
              var post = querystring.parse(body);
              var id = post.id; //form 태그에서 받아온 title이름\
              var filteredID = path.parse(id).base;
             fs.unlink(`data/${filteredID}`, function(error){  
                 response.writeHead(302, {Location: `/`});
                 response.end();
             });
  
        });
    }else{
      response.writeHead(404);
      response.end('Not found');
    }
 
 
 
});
app.listen(3000);
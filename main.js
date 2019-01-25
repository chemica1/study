var http = require('http');
var fs = require('fs');
var url = require('url');
var querystring = require('querystring')
 
function templateHTML(title, list, body, control){
  return `
  <!doctype html>
  <html>
  <head>
    <title>WEB1 - ${title}</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1><a href="/">WEB</a></h1>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}
function templateList(filelist){
  var list = '<ul>';
  var i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list+'</ul>';
  return list;
}
 
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    
    
    if(pathname === '/'){
          if(queryData.id === undefined){
            fs.readdir('./data', function(error, filelist){
              var title = 'Welcome';
              var description = 'Hello, Node.js';
              var list = templateList(filelist);
              var template = templateHTML(title, list, `<h2>${title}</h2>${description}`,`<a href="/create">create</a>`);
              response.writeHead(200);
              response.end(template);
            })
          }else{ //컨텐츠를 선택했을때 나오는 부분
            fs.readdir('./data', function(error, filelist){
              fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
                var title = queryData.id;
                var list = templateList(filelist);
                var template = templateHTML(title, list,
                                            `<h2>${title}</h2>${description}`,
                                            `<a href="/create">create</a>
                                            <a href="/update?id=${title}">update</a>

                                            <form action="delete_process" method="post">
                                            <input type="hidden" name="id" value="${title}">
                                            <input type="submit" value="delete">
                                            </form>`);
                response.writeHead(200);
                response.end(template);
              });
            });
          }
    }else if(pathname === '/create'){
         fs.readdir('./data', function(error, filelist){
          var title = '';
          var description = 'create';
          var list = templateList(filelist);
          var template = templateHTML(title, list,
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
          response.end(template);
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
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = templateList(filelist);//도메인 달면 작동안할수도action을 저렇게..  //textarea 태그에 내용은..
            var template = templateHTML(title, list,   `
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
                response.end(template);
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
              var id = post.id;
             fs.unlink(`data/${id}`, function(error){
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
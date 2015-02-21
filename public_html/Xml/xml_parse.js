
var xml = require("node-xml-lite"),
        fs=require('fs'),
        http=require('http'),
        DOWNLOAD_DIR='/home/aleksa/NodeProjects/NodeBot/public_html/Xml/xml/',
        XML_STANOVI='stanovi.xml',
        XML_KUCE='kuce.xml',
        clients_data={},
        database="nekretnine_moj_dom",
        validator = require('validator'),
       Engines=require('./xml_engines.js'),
       Mysql_iud=require('./mysql_iud.js')
        clients_data=require('./clients.js');
     



//load cients lists
Xml_engine(clients_data.clients);

 
function Xml_engine(obj){
     console.time('xml start')
    //----------------------------------
    //CONSTRUCTOR
    
     var index=0,
            data=[],
            saved_data=[];
     for(var i in obj){data.push(obj[i]);}
     var data_length=data.length;
      download_xml(data[index]);
  //----------------------------------
 /**
     * 
     * @param {type} domain
     * @param {type} file
     * @returns {undefined}
     * 
     * OPIS:
     * -----
     * download xml and call save_xml_file();
     * 
     * 
     */
function download_xml(data){
    var xml='',
         num=0; data.xml=[];
        var length=data.file.length-1;
     (function m_file(){
         var file=data.file[num];
         
         http.get(data.domain+data.file[num], function(res) { 
            res.on('data', function(chunk) {xml += chunk;});
            res.on('end', function() {
                var o={};
                o[data.file[num]]=xml;
                data.xml.push(o)
              //  data.xml[data.file[num]]=xml;
                num++;
                if (num>length) {save_xml_file();return false;}
                m_file(); 
                    
            
             });
        });
      //req.on('error', function(err) {if (err) {throw err;}});        
     }());
   

//m_file();
    
}
//---------------------------------------------------------   
    /**
     * 
     * @returns {undefined}
     * 
     * OPIS:
     * -----
     * Save clients xml file data to client folder;
     * Kada sacuva sve xml file od svi klienta onda poziva parse_xml() method
     * 
     * 
     */
    function save_xml_file(){
        var d=data[index],
                num=0;
     
        
         (function loop(){
          var file= Object.keys(d.xml[num])[0],
           xml=d.xml[num][file];
         fs.writeFile(DOWNLOAD_DIR+d.folder+'/'+file, xml, function(err) {
            if(err) {console.log(err);throw err;} 
            else {
                //file saved secessfyli
                console.log("File "+DOWNLOAD_DIR+d.folder+'/'+file+" saved");
                   //no more files (data.files=[])
                   if (num>=d.xml.length-1) {
                          saved_data.push(data[index]);  //file saved
                          index++;//call next client data
                          if (index<=data_length-1) {download_xml(data[index]);}//call next client data
                          else{console.log('all files saved!');parse_xml(saved_data);} //all files saved call parse engine
                   }else{
                        //loop file
                        num++;
                        loop();
                    }
             }
});}()); 
        





}
    //---------------------------------------------------------  
    
   /**
    * 
    * @param {type} data
    * @returns {undefined}
    * 
    * Ova funkcija prima kao param sve sacuvane agencije 
    * zatim ih vrti u loop koji prvo poziva xml_engines koji u callback poziva
    * mysql koji radi inser update i delete odredjenih client oglasa
    * 
    * 
    * ******************************************
    * Za SVAKOG CLENTA SE POZIVA SVE ISPOCETKA OVIM REDOSLEDOM:
    * Poziva se odgovarajuci engine (ENGINES)
    * insert update delete se radi u IUD CLASSI
    * ---------------------------------------------------------------
    * 
    * 
    * 
    */
   
   function parse_xml(data){
       var index=0;
  
       (function iud_mysql_data(){
              Engines.xmlengine(data[index],function(err,result){
                  if (err.length>0) {
                    console.error("Xml engine parser done with some errors:")
                    console.error(err)
                }
                  console.log('XML ENGINE DONE! Parsed agency:'+data[index].folder)
                  console.log('Call mysql IUD()')
                    Mysql_iud.mysql_iud(result,function(){
                        if (++index<data.length) {
                              iud_mysql_data();
                        }else{
                                console.log('ALL DATA UPDTED AND SAVED');
                                console.log("Total time:")
                                console.timeEnd('xml start'); 
                                process.kill(process.pid)
                        }         
                    });
            
            
            
            
            
    }); 
       }())

    
}

   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
   
}




















 











 
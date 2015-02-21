var mysql=require('mysql'),
connection= mysql.createConnection({user:'root',password : '',database:"nekretnine_project_baza"});
/*
 var data=[ 
     { 
     oglasi_nk: 
     { id_users_nk: 17,
       naslov: '20m2, Stan, Vukov spomenik',
       opis: 'NOVOGRADNJA, KLIMA, KTV, INTERNET, TELEFON, INTERFON, I sprat, cg. ',
       oglasivac: 2,
       kategorija: 1,
       prodaja_izdavanje: 2,
       datum_kreiranja_oglasa: '2015-02-12' },
    lokacija: { mesto: '1', deo_mesta: '2009', lokacija: '10446' },
    slike: 
     { slika_1: 'http://www.albatrosnekretnine.com/uploadSlike/966598slika4_e0231313-6b1e-4a95-b4a3-75f01309a47f_source_662x497.jpg',
       slika_2: 'http://www.albatrosnekretnine.com/uploadSlike/612719slika3_5e5122ad-c65a-490c-93d5-fe7d5c886a75_source_662x497.jpg',
       slika_3: 'http://www.albatrosnekretnine.com/uploadSlike/380863slika5_cba4ec21-7fd7-4746-aff6-a05c6e61d6a9_source_662x497.jpg',
       slika_4: 'http://www.albatrosnekretnine.com/uploadSlike/107723slika6_c971d0a5-0c5f-411e-8b11-c92503584751_source_662x497.jpg' },
    vrsta_oglasa: 
     { vrsta_oglasa: 1,
       datum_postavljanja_oglasa: '2015-02-12',
       datum_isteka: '2015-03-17 11:53:34',
       datum_azuriranja: '2015-02-12' },
    dodatni_podatci: {},
    dodatno: { cena: 200, broj_soba: 1, kvadratura: 20 },
    xml_engine: { sifra: '19851', id_users_nk: 17,'engine':'albatros' } 
},
{ oglasi_nk: 
     { id_users_nk: 17,
       naslov: '53m2, Stan, Vukov spomenik',
       opis: 'VUKOV SPOMENIK, NOVOGRADNJA, KLIMA, KTV, INTERNET, INTERFON, TELEFON, V sprat, cg.',
       oglasivac: 2,
       kategorija: 1,
       prodaja_izdavanje: 2,
       datum_kreiranja_oglasa: '2014-10-30' },
    lokacija: { mesto: '1', deo_mesta: '2009', lokacija: '10446' },
    slike: 
     { slika_1: 'http://www.albatrosnekretnine.com/uploadSlike/67279220141027153339T1414659394_540c.jpg',
       slika_2: 'http://www.albatrosnekretnine.com/uploadSlike/9165920141027153357T1414659471_540c.jpg',
       slika_3: 'http://www.albatrosnekretnine.com/uploadSlike/72784520141027153259T1414659454_540c.jpg',
       slika_4: 'http://www.albatrosnekretnine.com/uploadSlike/33375920141027153230T1414659431_540c.jpg' },
    vrsta_oglasa: 
     { vrsta_oglasa: 1,
       datum_postavljanja_oglasa: '2014-10-30',
       datum_isteka: '2015-03-17 14:53:23',
       datum_azuriranja: '2014-10-30' },
    dodatni_podatci: {},
    dodatno: { cena: 300, broj_soba: 1, kvadratura: 20 },
    xml_engine: { sifra: '17804', id_users_nk: 17, engine: 'albatros' } 
},

    ]


   








 
IUD(data)
*/


 

/**
 * 
 * @param {type} data
 * @returns {undefined}
 * 
 * 
 * KORISTI SE ZA insert, update, delete oglasa preko xml file
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */


function IUD(data,callback) {
    
    
             
            
    /*
     * 
     * CONSTORUCTOR
     * 
     */
    var index=0,
            insert_oglas=[],
            update_oglas=[],
            current_data,
            current_engine,
            data_length=data.length,
            sifre_xml=[];
    
    
    
    prepare_for_iu(data[index])

   
    
    
    
    
    /*
     *./CONSTORUCTOR
     * 
     * 
     */  
    
    
    
    /**
     * 
     * @param {type} obj
     * @returns {undefined}
     * 
     * 
     * SORTIRA OGLASE IZ XML-a  u array insert_oglas, update_oglas.
     * Zatim poziva odgovarajuce metode za insert ili update
     * 
     * 
     * 
     */
    function prepare_for_iu(obj){ 
   
        current_data=obj; //console.log(current_data)
        
        current_engine=current_data.xml_engine;
        var sifra=parseInt(current_engine.sifra);
      //  console.log(index)
         sifre_xml.push(sifra)
        var  query="select id_oglasi_nk from xml_engine where sifra="+sifra+" and id_users_nk="+parseInt(current_engine.id_users_nk)+" and engine='"+current_engine.engine+"'";
        connection.query(query, function(err, rows) {
                            if (err) {console.error(err);throw new Error('mysql error: '+err);}
                 if (rows.length===0) {insert_oglas.push(current_data);}          
                  else{
                      current_data.oglasi_nk.id_oglasi_nk=rows[0].id_oglasi_nk;
                      update_oglas.push(current_data);
                  
            }
               
               
               if (index<data.length-1) {
                 prepare_for_iu(data[++index]);
                 return;
            }
                 
           
              console.log('prepare_for_iu() done!\n Now call insert and update if needed.');
              
              
              
              
              
              
              insert(insert_oglas,function(){
                  update(update_oglas,function(){
                      delete_data(sifre_xml,current_engine.id_users_nk)
                  });
              }); 
      }); 
    }
    
    
    
    
        function delete_data(data,id){
            var delete_id=[];
                
        var q="SELECT * FROM `nekretnine_project_baza`.`xml_engine` where id_users_nk="+id;
        connection.query(q,function(err,rows){
           if(err) {throw new Error("delete query error!")}
            for(var i=0;i<rows.length;i++){
                if (data.indexOf(rows[i].sifra)<0) {
                    delete_id.push(rows[i].id_oglasi_nk);
                }
            }
            
            
            
            if (delete_id.length>0) {
                var delete_q="DELETE from oglasi_nk WHERE id_oglasi_nk IN ("+delete_id.toString()+")";
                connection.query(delete_q,function(err,rows){
                    if(err) {throw new Error("delete query error!")}
                    callback();
                })
                
                
            }else{
                console.log("Nema oglasa za brisanje!")
                callback();
            }
            
            
            
           
        })
    
        
        
        
        
        
        
        
        
        
        
         }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
      function update(arr_data,update_callback){
          if (arr_data.length===0) {
              console.log('No data for Update!')
              update_callback();
              return false;
        }
          
          
          
          console.log("Prepare data for Update. Total data for update: "+arr_data.length)
                     var data_length=arr_data.length,index=0;
                    
                     (function start_transaction(){
                         connection.beginTransaction(function(err) {  if (err) { throw err; }
                             var data=arr_data[index]//console.log(index)
                             var oglasi_nk=data.oglasi_nk;
                             var id=oglasi_nk.id_oglasi_nk;
                             var oglasi_nk_query=set_update('oglasi_nk',oglasi_nk,id);

                             connection.query(oglasi_nk_query, function(err, result) {
                                    if (err) {connection.rollback(function() {throw err;}); console.log(err)}

                                   //var id=result.insertId;
                                   delete data.oglasi_nk;

                                  query_update(data,id,function(r){
                                      connection.commit(function(err) {
                                          if (err) {connection.rollback(function() {throw err; });} 
                                          if (++index<=data_length-1) {start_transaction();}
                                          else{
                                              console.log('All file successfully saved ');
                                              console.log('Ukupno update oglasa: '+(index));
                                              console.timeEnd('xml start');
                                             console.warn("Loading file END!\n-----------------------")
                                               update_callback();
                                          }
                                          //console.log('Oglas sa id: '+id+' je uspesno sacuvan!');
                                      }); 
                                  });
                             });
                         }); 
                     }());  
      
       
       }
    
    
    
    function query_update(data,id,callback){
                    var i=0;//start loop
                     var data_length=Object.keys(data).length;//count object keys
                   return  (function create_q(){
                      var curr_key=Object.keys(data)[i];//get object key in loop
                      data[curr_key].id_oglasi_nk=id;//set oglas id
                      var curr_table=set_update(curr_key,data[curr_key],id);//generisanje sql insert sa odredenim objektom
                     // console.log(curr_table)
                     //STARTUJE SE QUERY UNUTAR TRANSAKCIJE
                     connection.query(curr_table, function(err, result) {
                     if (err) {connection.rollback(function() {throw err;});}
                         if (++i<=data_length-1) {create_q();}//LOOP again
                         else{callback(result);}//end loop call callback tj. zove commit sa obzirom da smo u transakciji
                   });}());
 }
    
    
    function set_update(table,obj,id){
             var set="";
             for(var i in obj){
                 set+=i+'='+mysql.escape(obj[i])+',';
             }
            return 'update '+table+' SET '+set.slice(0,set.length-1)+" where id_oglasi_nk="+id;

   };
    

    
    /**
     * 
     * @param {type} arr_data
     * @returns {undefined}
     * 
     * 
     * Insertovanje novih oglasa unutar transakcije
     * 
     * OPIS:
     * -----
     * Startuje se transakcija u loop fazonu;
     * Prvo se ubacuju podatci u tabelu oglasi_nk pa se uzima id , da bih se ubaicvao u druge oglase zbog forein key
     * zatim se poziva function query_insert sa params:trenutni objekt za ubacivanje u bazu, id_oglasi_nk i callback funkcija koja izvrsava commit svih upita i poziva sledeci objekt za ubacivanje!
     * 
     * 
     */
     function insert(arr_data,insert_callback){
         if (arr_data.length===0) {
            console.log("No data for insert!")
            insert_callback();
            return false;
        }
         console.log('Prepare data for insert. Total data for insert: '+arr_data.length)
                    var data_length=arr_data.length,index=0;
                    
                     (function start_transaction(){
                         connection.beginTransaction(function(err) {  if (err) { throw err; }
                             var data=arr_data[index]//console.log(index)
                             var oglasi_nk=data.oglasi_nk;
                             var oglasi_nk_query=set_insert('oglasi_nk',oglasi_nk);
                            // console.log(oglasi_nk_query)
                             connection.query(oglasi_nk_query, function(err, result) {
                                    if (err) {connection.rollback(function() {throw err;}); console.log(err);console.error('ognasi_nk error')}
                                    
                                   var id=result.insertId;
                                   delete data.oglasi_nk;

                                  query_insert(data,id,function(r){
                                      connection.commit(function(err) {
                                          if (err) {connection.rollback(function() {throw err; });} 
                                          if (++index<=data_length-1) {start_transaction();}
                                          else{
                                              console.log('Insert data done!');
                                              console.log('Total insert: '+(index));
                                              console.timeEnd('xml start');
                                            //  connection.end();
                                              insert_callback();
                                          }
                                          //console.log('Oglas sa id: '+id+' je uspesno sacuvan!');
                                      }); 
                                  });
                             });
                         }); 
                     }());      
     }
    
    
    
    
    
    
    /**
     * 
     * @param {type} table
     * @param {type} obj
     * @returns {String}
     * 
     * 
     * vraca generisani string iz insert into
     * 
     * 
     */  
    function set_insert(table,obj){
             var s='insert into '+table+' (';
             var k="";
             var v="";
             for(var i in obj){
                  k+=i+',';
                  v+=mysql.escape(obj[i])+',';
             }
             return 'insert into '+table+' ('+k.slice(0,k.length-1)+') values('+v.slice(0,v.length-1)+')';

   };
    
 
    
  


/**
 * 
 * @param {type} data
 * @param {type} id
 * @param {type} callback
 * @returns {Function|undefined}
 * 
 * 
 * ova funkcija je komplikovana zato sto je nejasno kako sam ovo napravio
 * NI SAM NE ZNAM KAKO OVO RADI!!!!!!!!*******!!!!!!
 * OPIS:
 * -----
 * Funkcija uzima sve keys od objecta data(param#1)
 * vraca function koja koja generise query za svaki object(data) key value par,
 * 
 * Pogledati inline comments;
 * 
 * 
 * 
 * 
 * 
 */
function query_insert(data,id,callback){
   var i=0;//start loop
    var data_length=Object.keys(data).length;//count object keys
  return  (function create_q(){
     var curr_key=Object.keys(data)[i];//get object key in loop
     data[curr_key].id_oglasi_nk=id;//set oglas id
     var curr_table=set_insert(curr_key,data[curr_key])//generisanje sql insert sa odredenim objektom
    //STARTUJE SE QUERY UNUTAR TRANSAKCIJE
    connection.query(curr_table, function(err, result) {
    if (err) {connection.rollback(function() {throw err;});}
        if (++i<=data_length-1) {create_q();}//LOOP again
        else{callback(result)}//end loop call callback tj. zove commit sa obzirom da smo u transakciji
  });}());
 }


    
    
  
    

    
    
    
    
    
}

exports.mysql_iud = IUD;

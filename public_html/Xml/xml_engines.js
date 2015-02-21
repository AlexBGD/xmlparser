var fs = require('fs'),
        xml2js = require('xml2js'),
        parser = new xml2js.Parser(),
        DOWNLOAD_DIR='/home/aleksa/NodeProjects/NodeBot/public_html/Xml/xml/',
        tables={},
        errors=[],
        Locations=require('./Lokacije.js').lokacije,
        xss=require('xss');



var Engines=['realitica','kucars','albatros','estan','jovanns'];

/**
 * 
 * @param {OBJECT} data
 * @param {type} callback
 * @returns {undefined}
 * 
 * 
 * 
 * OPIS:
 * -----
 * Params data je object od jednog clineta iz file clients.js.
 * Proveraa se odgovarajuci ENgin i shodno tome se pravi izlaz 
 * za mysql;
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 


Xml_engines({
  domain:"http://astranekretnine.com/xml/",
    user_id:17,
    folder:"astra",
    file:['astrarent-kucars.xml'],
    engine:'kucars'
},function(err,r){
    console.log(r)
})

 */

 
function Xml_engines(data,callback) {
    var user_id,
            errors=[];
          /*  tables={
                oglasi_nk:{
                    'id_users_nk':arr.user_id,
                        
                }
            };*/
    
    get_root(data);
    

  
    
     
    function get_root(data){
        
            fs.readFile(DOWNLOAD_DIR+data.folder+'/'+data.file[0], function(err, xml_str) {
                if (err) { console.error(err);throw err;}
                parser.parseString(xml_str, function (err, result) {
                    if (err) { console.error(err);throw err;}
                    user_id=data.user_id;
                    console.warn("Loading file starts!")
                    console.log('File:'+DOWNLOAD_DIR+data.folder+'/'+data.file[0]+" je uspesno parsiran...\n Ucitava se odgovarajuci engine...");
                      switch(data.engine){
                                    case 'kucars':kucars(result);break;
                                    case "albatros": albatros(result);break;
                                    default: throw new Error("no engine in engine lists named: "+data.engine);break;
                      } 
                    
                });
            });
        
        
      
    }

    
    
    
    
    
    
      
    function kucars(root){
        console.log('Engine kucars se poziva...');
       var xml=root.oglasi.oglas,
               table={},
               tables=[],
               x,
               kategorija,
               lokacija_full,
               slike=[],
               namestenost=['Namešten','Polunamešten','Prazan'],
               gr,
               d,
               date_mysql,
               naslov,
               errors=[];
       
      var date=new Date();
      date.setMonth(date.getMonth() + 1); 
      var date_mysql_istice=date.toISOString().slice(0, 19).replace('T', ' ');
  

        
        for(var i=0;i<xml.length;i++){
          //  console.log(xml[i]);
            x=xml[i];
            table={};//reset
            kategorija=kategorija_to_db(x.vrsta_nekretnine[0]);
            if (!kategorija) {
                errors.push({'Kategorija kucars':x.vrsta_nekretnine[0]});
                continue;
            }
            lokacija_full=search_location('beograd',x.lokacija[0])
            if (!lokacija_full) {
              errors.push({"Lokacija kucars":x.lokacija[0]})
              continue;
            }
            
             
            lokacija_full=lokacija_full.result.id.split('-');
            if (lokacija_full.length<1) {continue;}
        
         
          
         
         d = new Date(); 
         d.setTime(parseInt(x.azuriran[0]) * 1000);
         date_mysql=d.toISOString().slice(0, 19).replace('T', ' ');
         
         naslov=x.vrsta_nekretnine[0]+" ";
         naslov+=x.povrsina[0]<1?"":x.povrsina[0]+"m2 ";
         naslov+=x.cena[0]+"e";
         
         
         
            
                                      table.oglasi_nk={
                                            'naslov':xss(naslov),
                                            'opis':xss(x.opis[0]),
                                            'oglasivac':2,
                                            'kategorija':kategorija,
                                            'prodaja_izdavanje':x.tip_oglasa[0]==='Izdavanje'?2:1,
                                            'datum_kreiranja_oglasa':date_mysql,
                                            id_users_nk:user_id,

                                        };

                                       table.lokacija={
                                           'mesto': lokacija_full[0],
                                           'deo_mesta':lokacija_full[1],
                                           'lokacija':lokacija_full[2] || 0
                                       }

                                       //slike
                                       slike=x.slike[0].slika;
                                       table.slike={};
                                       for(var k=0;k<slike.length;k++){
                                           if ((k+1)>10) {break;}
                                           table.slike['slika_'+(k+1)]=slike[k];
                                       
                                       }      


                                   table.vrsta_oglasa={
                                     'vrsta_oglasa':1,
                                   'datum_postavljanja_oglasa':date_mysql,
                                    'datum_isteka':date_mysql_istice,
                                      'datum_azuriranja':date_mysql
                                   };

                                     table.dodatni_podatci={};
                                     if (x.terasa[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.terasa=1;
                                     }if (x.telefon[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.dodatni_podatci_telefon=1;
                                     }if (x.lift[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.lift=1;
                                     }if (x.parking[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.parking=1;
                                     }if (x.garaza[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.dodatno_graza=1;
                                     }if (x.internet[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.internet=1;
                                     }if (x.podrum[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.podrum=1;
                                     }if (x.uknjizen[0].toLowerCase()==='da') {
                                         table.dodatni_podatci.uknjizen=1;
                                     }
                                   
                                   

                                      //dodatno
                                   
                                   table.dodatno={
                                       cena:parseInt(x.cena[0]),
                                   };
                                   if ('broj_soba' in x&&x.broj_soba[0]>0) {
                                        var bs=parseInt(x.broj_soba[0]);
                                       table.dodatno.broj_soba=bs>5?5:bs;
                                   }if (namestenost.indexOf(x.opremljenost[0])>-1) {
                                       table.dodatno.namestenost=namestenost.indexOf(x.opremljenost[0])+1;
                                    }if (x.sprat[0]>0) {
                                        table.dodatno.spratovi=x.sprat[0];
                                    }if (gr=grejanje(x.grejanje[0])) {
                                        table.dodatno.grejanje=gr;
                                    }if (x.novogradnja[0].toLowerCase()==='da') {
                                            table.dodatno.tip_objekta=3;
                                    }if (x.povrsina[0]>0) {
                                        table.dodatno.kvadratura=parseInt(x.povrsina[0]);
            }
                                    
                                    
                                    
                                    
                                    
                                    
                                    
                                table.xml_engine={
                                    sifra:parseInt(x.id[0]),
                                    id_users_nk:user_id,
                                    'engine':'kucars'

                                }


                                  //create required tables
                                  switch(kategorija){
                                      case 3:table.kuce={};break;
                                      case 5:table.plac={};break;
                                  }





                               tables.push(table);
                             }
                        //    console.log(tables)
                          callback(errors,tables)
        }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    
    
    /*
     * 
     * 
     */
    
    
       function search_location(mesto,lokacija){
           lokacija=replace_cyrillic(lokacija).replace(/[^a-z0-9\s]/gi,' ').trim().toLowerCase();
           mesto=replace_cyrillic(mesto).replace(/[^a-z0-9\s]/gi,' ').trim().toLowerCase();
          // console.log(mesto);
        //   console.log(lokacija)
          var arr_loc=[],ol={};
          var ret_obj={
              query:{
                  mesto:mesto,
                  lokacija:lokacija
              },
              result:{
                id:false,
                lokacija:false
               }
          };
       
          
           if (mesto==='beograd') {
              var beograd=Locations[1].Beograd; 
           switch(lokacija){
               case"centar":ret_obj.result={id:'1-2005-10297',lokacija:'centar'};return ret_obj;
               case "vracar":ret_obj.result={id:'1-2007',lokacija:'vracar'};return ret_obj;
               case "vozdovac":ret_obj.result={id:'1-2006',lokacija:'vozdovac'};return ret_obj;
               case "bezanijska kosa":ret_obj.result={id:'1-2001-10105',lokacija:'Bežanijska kosa 1'};return ret_obj;
               case "medakovic":ret_obj.result={id:'1-2006-10356',lokacija:'Medaković 3'};return ret_obj;
               case "novi beograd belvill":case "novi bgd belvill":ret_obj.result={id:'1-2001-10148',lokacija:' Blok 67 (Belvil)'};return ret_obj;
               case "centar skupstina":ret_obj.result={id:'1-2005-10314',lokacija:'Skupština'};return ret_obj;
               case "centar terazije":ret_obj.result={id:'1-2005-10317',lokacija:'Terazije'};return ret_obj;
                   case "novi bgd genex":ret_obj.result={id:'1-2001-10122',lokacija:'Blok 33'};return ret_obj;
                    case "novi bgd hyatt":ret_obj.result={id:'1-2001-10157',lokacija:'Hotel Hyatt'};return ret_obj;
                         case "novi bgd blokovi":ret_obj.result={id:'1-2001',lokacija:'Novi Beograd'};return ret_obj;
                              case "zemun sava kovacevic":ret_obj.result={id:'1-2008-10417',lokacija:'Save Kovačevića'};return ret_obj;
           }   
       
          
       //loop belgrade 
             for(var i in beograd){
                for(var k in beograd[i]){
                    beograd[i][k]=replace_cyrillic(beograd[i][k]).toLowerCase().replace(/[^a-z0-9\s]/gi,'');
                   
                     
                     if (lokacija.indexOf(beograd[i][k])>-1) {
                             if (arr_loc.length>0) {
                                 for(var x=0;x<arr_loc.length;x++){
                                     for(var y in arr_loc[x]){
                                         if (beograd[i][k].length>arr_loc[x][y].length) {
                                             arr_loc=[];
                                             ol={id:k,text:beograd[i][k]};
                                             arr_loc.push(ol);
                                         }
                                     }
                                 }
                             }else{
                                  ol={id:k,text:beograd[i][k]};
                                  arr_loc.push(ol);
                             }
                     } 
                }
             }
   
                   
                   
   
          
       
           if (arr_loc.length===1) {
           ret_obj.result={id:arr_loc[0].id,lokacija:arr_loc[0].text};
           return ret_obj;
            }else{
                
               console.error("-----------------------------------");
                console.error(mesto);
                console.error(lokacija);
                console.error("-----------------------------------");
                return false;
            }
       }
           else if(mesto==='novi sad'){
                   var novi_sad=Locations[2]['Novi Sad'];
                    switch(lokacija){
                        case "bistrica": ret_obj.result={id:'2-2017-10553',lokacija:'Novo Naselje'};return ret_obj;
                          case "bulevar": ret_obj.result={id:'2-2017-10517',lokacija:'Bulevar Oslobođenja'};return ret_obj;
                          case "avijacija": ret_obj.result={id:'2-2017-10511',lokacija:'Avijatičarsko naselje'};return ret_obj;
                     }
                 
              
                   for(var i in novi_sad){
                   novi_sad[i]=replace_cyrillic(novi_sad[i]).toLowerCase().replace(/[^a-z0-9\s]/gi,'');
                    if (lokacija.indexOf(novi_sad[i])>-1) {
                         if (arr_loc.length>0) {
                                 for(var x=0;x<arr_loc.length;x++){
                                     for(var y in arr_loc[x]){
                                         if (novi_sad[i].length>arr_loc[x][y].length) {
                                             arr_loc=[];
                                             ol={id:i,text:novi_sad[i]};
                                             arr_loc.push(ol);
                                         }
                                     }
                                 }
                             }else{
                                  ol={id:i,text:novi_sad[i]};
                                  arr_loc.push(ol);
                             }
                        
                        
                     
                    }
               }
                 if (arr_loc) {
                         ret_obj.result={id:arr_loc[0].id,lokacija:arr_loc[0].text};
                         return ret_obj;
                     }else{
                     //NEISPRAVNE LOKAICJE ZA NOVI SAD
                   
                       /*  console.error("-----------------------------------");
                         console.error("NEISPRAVNE LOKACIJE ZA NOVI SAD")
                         console.error(mesto);
                         console.error(lokacija);
                       
                         console.error("-----------------------------------");*/
                         return false;
                 
                     }
               
           }
           
           
           
           
           
           
           else{ 
            //   console.error('ELSE not bg or ns');
            //  return false;
               //ispravke za total nekrentine zato sto nisu pisali IMENA GRADOVA
               switch(mesto){
                   case "futog":ret_obj.result={id:'2-2017-10525',lokacija:'Futog'};return ret_obj;
                       case "veternik":ret_obj.result={id:'2-2017-10592',lokacija:'Veternik'};return ret_obj;
                           case "petrovaradin": ret_obj.result={id:'2-2018-10493',lokacija:'Petrovaradin'};return ret_obj;
                               case "sremska kamenica":ret_obj.result={id:'2-2018-1050',lokacija:'Sremska Kamenica'};return ret_obj;
                                   case "bukovac": ret_obj.result={id:'2-2018-10480',lokacija:'Bukovac'};return ret_obj;
                                       case "rumenka": ret_obj.result={id:'2-2017-10567',lokacija:'Rumenka'};return ret_obj;
                                            case "kac": ret_obj.result={id:'2-2017-10532',lokacija:'Kać'};return ret_obj;
                                               case "cenej": ret_obj.result={id:'2-2017-10519',lokacija:'Čenej'};return ret_obj;
                 }
               //--------------------------------------------------------------------------------
               var lo=[];
                switch(mesto){
                    case "nis":lo.push(Locations[3]['Nis']);break;
                    case "kragujevac":lo.push(Locations[4]['Kragujevac']);break;
                    case "ada":lo.push(Locations[5]['Ada']);break;
                    case "aleksandrovac":lo.push(Locations[6]['Aleksandrovac']);break;
                        case "aleksinac":lo.push(Locations[7]['Aleksinac']);break;
                            case "jagodina":lo.push(Locations[46]['Jagodina']);break;
                                case "kikinda":lo.push(Locations[49]['Kikinda']);break;
                                    case "kladovo":lo.push(Locations[50]['Kladovo']);break;
                                        case "knjazevac":lo.push(Locations[53]['Knjazevac']);break;
                       case "novi pazar":lo.push(Locations[91]['Novi Pazar']);break;
                                                case "pancevo":lo.push(Locations[98]['Pancevo']);break;
                                                    case "paracin":lo.push(Locations[99]['Paracin']);break;
                                                        case "pirot":lo.push(Locations[103]['Pirot']);break;
                                                            case "pozarevac":lo.push(Locations[106]['Pozarevac']);break;
                                                                case "pozega":lo.push(Locations[107]['Pozega']);break;
                                                                    case "ruma":lo.push(Locations[118]['Ruma']);break;
                                                                        case "smederevo":lo.push(Locations[122]['Smederevo']);break;
                                                                            case "sokobanja":lo.push(Locations[124]['Sokobanja']);break;
                                                                                case "sombor":lo.push(Locations[125]['Sombor']);break;
                                                                                    case "stara pazova":lo.push(Locations[130]['Stara Pazova']);break;
                                                                                    
                                                                                        case "subotica":lo.push(Locations[131]['Subotica']);break;
                                                                                            case "uzice":lo.push(Locations[145]['Uzice']);break;
                                                                                                case "valjevo":lo.push(Locations[146]['Valjevo']);break;
                                                                                                    case "vranje":lo.push(Locations[154]['Vranje']);break;
                                                                                                        case "vrbas":lo.push(Locations[156]['Vrbas']);break;
                                                                                                            case "vrnjacka banja":lo.push(Locations[157]['Vrnjacka Banja']);break;
                                                                                                                case "vrsac":lo.push(Locations[158]['Vrsac']);break;
                                                                                                                    case "zajecar":lo.push(Locations[160]['Zajecar']);break;
                                                                                                                        case "zlatibor":lo.push(Locations[161]['Zlatibor']);break;
                                                                                                                            case "zrenjanin":lo.push(Locations[162]['Zrenjanin']);break;
                                                                                                                                case "cacak":lo.push(Locations[168]['cacak']);break;
                                                                                                                                    case "sabac":lo.push(Locations[171]['sabac']);break;
                  }
               
               if (lo.length>0) {
                  arr_loc=search_obj(lo[0],lokacija);
                   
                  
            }else{
              arr_loc=search_obj(Locations['Manja Mesta'],mesto);
              
            }
               
               
               if (!arr_loc) {
                return false;
            } 
               ret_obj.result={id:arr_loc[0].id,lokacija:arr_loc[0].text};
                   return ret_obj;
               
               
               
             /*  console.error(mesto)
               console.error(lokacija)
               console.error("-----------------------------------");*/
           }
           
           
   
        
        
    }
    
    
    
     
    function search_obj(obj,lokacija){
        
        var arr_loc=[],ol={};
              for(var i in obj){
                   obj[i]=replace_cyrillic(obj[i]).toLowerCase().replace(/[^a-z0-9\s]/gi,'');
                    if (lokacija.indexOf(obj[i])>-1) {
                         if (arr_loc.length>0) {
                                 for(var x=0;x<arr_loc.length;x++){
                                     for(var y in arr_loc[x]){
                                         if (obj[i].length>arr_loc[x][y].length) {
                                             arr_loc=[];
                                             ol={id:i,text:obj[i]};
                                             arr_loc.push(ol);
                                         }
                                     }
                                 }
                             }else{
                                  ol={id:i,text:obj[i]};
                                  arr_loc.push(ol);
                             }
                        
                        
                     
                    }
               }
               return arr_loc.length>0?arr_loc:false;
               
    }
    
    
  
  
    
    
    
    
        function replace_cyrillic(str){
      
             var cir=['č','ć','đ','š','ž','Č','Ć','Đ','Š','Ž'];
             var lat=['c','c','d','s','z','C','C','D','S','Z'];  
       for(var i=0;i<cir.length;i++){
            if (str.indexOf(cir[i])>-1) {
                str=str.replace(new RegExp(cir[i],'g'),lat[i]);
            //    str=str.replace(cir[i],lat[i]);
            }
       } 
      
       return str;
    }
    
    
    function slice_string(str,len){
       return str.length<len?str:str.slice(0,len);
    }
    
    
    
    
    
    
    function kategorija_to_db(str) {
             switch(replace_cyrillic(str).toLowerCase()){
                     case 'stan': return 1;
                     case 'soba':return  2;
                     case 'kuca':return  3;
                     case 'garaza':return  4;
                     case 'plac':return  5;
                     case 'lokal':case "lokali":return  6;
                     case 'poslovni prostor':
                     case 'poslovni objekat':return 7 ;
                     case 'hala':return  8; 
                     case 'magacin':return 9 ;
                     case 'poljoprivredno zemljiste':return 10 ;
                     case 'gradjevinsko zemljiste':case 'gradevinska zemljista':return  11;                    
                     case 'vikendica':case 'vikendice':return 12 ;
                     case 'apartmani':return  13; 
                     case 'selidbe':return  14;  
                     default:return false;
             }
             
     }
    
    
    
     function grejanje(str){
              
           switch(replace_cyrillic(str).toLowerCase()){
               case 'cg':return 1;
               case 'eg':case 'etazno':return 2;
               case 'ta':return 3;
               case 'gas':return 4;
               case 'podno':return 5;
               case 'kaljeva pec':return 6;
               case 'norveski radiatori':return 7;
               case 'mermerni radiatori':return 8;
               default:return false;
           }
          }
    
    
    
    
    
    
    
    
    
    
    /**
     * 
     * @param {type} result
     * @returns {Xml_engines.albatros.tables|Array}
     * Prilagodjava xml za mysql iud
     * 
     * 
     */
    
      function albatros(result){
                                console.log('startuje se albatros ENGINE!');
                                var tables=[],table={},kategorija,table_loc 
                                var date=new Date();
                                date.setMonth(date.getMonth() + 1); 
                                var date_mysql=date.toISOString().slice(0, 19).replace('T', ' ');
                                
                                var data =result.ArrayOfDataObject.DataObject,//xml root
                                        advert,
                                        slike=[],
                                        dodatno,
                                        source;
                                
                               for(var i=0;i<data.length;i++){
                                   table={};//reset
                                   advert=data[i].AdvertMain[0] ;
                                   source=data[i].Source[0]; 
                                   kategorija=kategorija_to_db(source.Path1[0]);
                                   if (!kategorija) {
                                      errors.push({'Albatros Kategorija':source.Path1[0]})
                                      continue;
                                  }
                                  table_loc=location_albatros(data[i].Addresses[0].Address);

                                   if (!table_loc) {
                                       errors.push({'Albatros lokacija':data[i].Addresses[0].Address})
                                       continue;
                                  }
                                  
                            table_loc=table_loc.result.id.split('-');
                                     //currency
                              //  console.log(advert.Price[0].Currency[0]);
                                      table.oglasi_nk={
                                            'naslov':xss(slice_string(advert.Abstract[0],50)),
                                            'opis':xss(slice_string(advert.Description[0],500)),
                                            'oglasivac':2,
                                            'kategorija':kategorija,
                                            'prodaja_izdavanje':advert.Type[0]==='Sell'?1:2,
                                            'datum_kreiranja_oglasa':source.DateCreated[0],
                                            id_users_nk:user_id,

                                        };

                                       table.lokacija={
                                           'mesto': table_loc[0],
                                           'deo_mesta':table_loc[1],
                                           'lokacija':table_loc[2] || 0
                                       }

                                       //slike
                                       slike=data[i].Attachments[0].Attachment;
                                       table.slike={};
                                       for(var k=0;k<slike.length;k++){
                                           if ((k+1)>10) {break;}
                                           if (slike[k].DataType[0]==='Image') {
                                                   table.slike['slika_'+(k+1)]=slike[k].Path[0];
                                           }
                                       }      


                                   table.vrsta_oglasa={
                                     'vrsta_oglasa':1,
                                     'datum_postavljanja_oglasa':source.DateCreated[0],
                                     'datum_isteka':date_mysql,
                                     'datum_azuriranja':source.DateModified[0]
                                   };

                                   table.dodatni_podatci={};

                                      //dodatno
                                   dodatno=data[0].Attributes[0].Attribute;


                                   table.dodatno={
                                       cena:parseInt(advert.Price[0].Value[0]),
                                   };
                                       for(var x=0;x<dodatno.length;x++){
                                       // console.log(dodatno[x])
                                       //  console.log(dodatno[x].Name[0])
                                          if (dodatno[x].Name[0]==='norooms'&&dodatno[x].Value[0]>0) {
                                             dodatno[x].Value[0]=parseInt(dodatno[x].Value[0]);
                                              table.dodatno['broj_soba']=dodatno[x].Value[0]>5?5:dodatno[x].Value[0];
                                          }else if (dodatno[x].Name[0]==='reArea') {
                                                table.dodatno.kvadratura=parseInt(dodatno[x].Value[0]);
                                          }
                                       }

                                table.xml_engine={
                                    sifra:parseInt(advert.UniqueKey[0]),
                                    id_users_nk:user_id,
                                    'engine':'albatros'

                                }


                                  //create required tables
                                  //
                                  switch(kategorija){
                                      case 3:table.kuce={};break;
                                      case 5:table.plac={};break;
                                  }





                               tables.push(table);
                             }
                            // console.log(tables)
                            callback(errors,tables)
                           
    }
    
    
    
        function location_albatros(lok){
       if (lok[0].CountryCode[0].toLowerCase()!=='rs') {
            errors.push({'location_albatros':'Not in rs!'});
            return false;
        }
       return search_location(lok[0].City[0],lok[0].Quarter[0]);
 
        
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
}









exports.xmlengine = Xml_engines;

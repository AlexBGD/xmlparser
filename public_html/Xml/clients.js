var clients_data={};

//var Engines=['realitica','kucars','albatros','estan','jovanns'];


/*
clients_data.mag_nekrentine={
    domain:"http://www.mag-nekretnine.com/xml/",
    user_id:"39",
    folder:"mag",
    file:['stanovi.xml','kuce.xml'],
    engine:'jovanns'
};

clients_data.moj_dom={
    domain:"http://www.nekretnine-mojdom.com/xml/",
    user_id:"39",
    folder:"mojdom",
    file:['stanovi.xml','kuce.xml'],
    engine:'jovanns'
};
*/

clients_data.astra={
    domain:"http://astranekretnine.com/xml/",
    user_id:17,
    folder:"astra",
    file:['astrarent-kucars.xml'],
    engine:'kucars'
};


clients_data.eminent={
    domain:"http://eminentnekretnine.rs/xml/",
    user_id:37,
    folder:"eminent",
    file:['eminent-kucars.xml'],
    engine:'kucars'
};

clients_data.albatros={
    domain:"http://www.albatrosnekretnine.com/xml/albatros/",
    user_id:39,
    folder:"albatros",
    file:['albatros.xml'] ,
    engine:'albatros'
}
clients_data.total={
    domain:"http://www.total-nekretnine.rs/",
    user_id:51,
    folder:"total",
    file:['totalnekretnine.xml'] ,
    engine:'albatros'
}
exports.clients = clients_data;

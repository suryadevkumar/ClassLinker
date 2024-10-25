const express=require('express');
const oracledb=require('oracledb');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');

const app = express();
const upload = multer();

const dbConfig = {
    user: 'system',
    password: '0786',
    connectString: 'localhost:1521/orcl'
};

app.use(bodyParser.json());

//file connection
app.use(express.static(path.join(__dirname, '/')));

//send OTP to mail
function generateOTP()
{
    return Math.floor(1000+Math.random()*9000).toString();
}
let otp1='10000';
let otp2='10000';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'suryadevkumar786786@gmail.com',
        pass: 'vgaj lkdh tgbx ephk'
    }
});

//check email are in used or not
app.post('/checkEmailUsed',async(req,res)=>{
    const{instMail, adMail}=req.body;
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result1=await connection.execute(`SELECT COUNT(ins_id) FROM institute WHERE ins_gmail=:gmail`,{gmail:instMail});
        const result2=await connection.execute(`SELECT COUNT(ins_id) FROM institute WHERE ad_email=:gmail`,{gmail:adMail});
        const count1 = result1.rows[0][0];
        const count2 = result2.rows[0][0];
        if(count1>0)
            res.send('institute');
        else if(count2>0)
            res.send('admin');
        else
        res.send('good');
    }
    catch(err){
        console.log(err);
    }
    finally{
        if(connection)
        {
            try{
                connection.close();
            }
            catch(err)
            {
                console.error(err);
            }
        }
            
    }
})

//send OTP to institute email
let instituteMail='';
app.post('/sendInsEmail', (req, res) => {
    let { email } = req.body;
    if (!email) {
        email = instituteMail;
    }
    instituteMail=email;
    otp1=generateOTP();
    const mailOptions = {
        from: 'suryadevkumar786786@gmail.com',
        to: email,
        subject: 'ClassLinker Email Verification',
        text: `Welcome to ClassLinker!
        your OTP is ${otp1}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
            return res.send('Error sending email. Try again later.');
        } else {
            console.log('Email sent:', info.response);
            return res.send('OTP Sent Successfully!');
        }
    });
});

//send OTP to admin email
app.post('/sendAdEmail', (req, res) => {
    const { email } = req.body;
    otp2=generateOTP();
    const mailOptions = {
        from: 'suryadevkumar786786@gmail.com',
        to: email,
        subject: 'ClassLinker Email Verification',
        text: `Welcome to ClassLinker!
        your OTP is ${otp2}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error:', error);
            return res.send('Error sending email. Try again later.');
        } else {
            console.log('Email sent:', info.response);
            return res.send('OTP Sent Successfully!');
        }
    });
});

//verify institute otp is correct or not
app.post('/verifyOTP1',(req,res)=>{
    const {insOTP}=req.body;
    if(insOTP==otp1)
        res.send('true');
    else
    res.send('false');
})

//verify admin otp is correct or not
app.post('/verifyOTP2',(req,res)=>{
    const {adOTP}=req.body;
    if(adOTP==otp2)
        res.send('true');
    else
    res.send('false');
})

//institute signup function
app.post('/instituteSignup',upload.single('photo'), async(req,res)=>{
    const{insName, insCode, insMob, insMail, insAddress, adName, adMob, adMail, pass, CNFpass, insOTP, adOTP}=req.body;
    const adminPic=req.file?.buffer;
    console.log(insName, insCode, insMob, insMail, insAddress, adName, adMob, adMail, pass, CNFpass, insOTP, adOTP);
    const hashPass= await bcrypt.hash(pass,10);
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        connection.execute(
            `INSERT INTO INSTITUTE (ins_id, ins_name, ins_code,ins_address, ins_email, ins_mobile, ins_pass, ad_name, ad_mobile, ad_email, ad_pic)
            VALUES (ins_id_seq.NEXTVAL, :insName, :insCode, :insAddress, :insMail, :insMob, :hashPass, :adName, :adMob, :adMail, :adminPic)`,
        {insName,insCode, insAddress, insMail, insMob, hashPass, adName, adMob, adMail, adminPic: { val: adminPic, type: oracledb.BLOB }},
        {autoCommit: true})
        res.send('Signup Successful')
    }
    catch(err)
    {
        console.error(err);
    }
    finally{
        if(connection)
        {
            try{
                connection.close();
            }
            catch(err)
            {
                console.error(err);
            }
        }
    }
})

//admin login function
let adminMail='';
app.post('/adminLogin',async (req,res)=>{
    const {adMail, pass}=req.body;
    adminMail=adMail;
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT ins_pass FROM institute WHERE ad_email=:adMail`,{adMail: adMail});
        if(result.rows[0])
        {
            if(await bcrypt.compare(pass,result.rows[0][0]))
            res.send('true');
            else
            res.send('false');
        }   
        else 
            res.send('false');
    }
    catch(err){
        console.error(err);
    }
    finally{
        if(connection)
        {
            try{
                connection.close();
            }
            catch(err){
                console.error(err);
            }
        }
    }
})

//institute send otp to login
app.post('/insOTPLogin',async (req,res)=>{
    const {insMail, pass}=req.body;
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT ins_pass FROM institute WHERE ins_email=:insMail`,{insMail: insMail});
        if(result.rows[0])
        {
            if(await bcrypt.compare(pass,result.rows[0][0]))
            res.send('true');
            else
            res.send('false');
        }
        else
            res.send('false');
    }
    catch(err){
        console.error(err);
    }
    finally{
        if(connection)
        {
            try{
                connection.close();
            }
            catch(err){
                console.error(err);
            }
        }
    }
})

//function for institute login data fetch
app.get('/insLogin',async (req,res)=>{
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`
            SELECT ins_name, ins_code, ins_email, ins_mobile, ad_email FROM institute WHERE ins_email=:email`,
            {email: instituteMail});
            console.log(result.rows[0]);
            adminMail=result.rows[0][4];
            console.log(result.rows[0][4]);
            res.json(result.rows[0]);
    }
    catch(err){
        console.error(err);
    }
    finally{
        if(connection)
        {
            try{
                connection.close();
            }
            catch(err){
                console.error(err);
            }
        }
    }

})

//function for admin credentials data fetch
app.get('/fetchAdminCredentials',async (req,res)=>{
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`
            SELECT ad_name, ad_email, ad_mobile FROM institute WHERE ad_email=:email`,
            {email: adminMail});
        console.log(result.rows[0]);
        res.json(result.rows[0]);
    }
    catch(err){
        console.error(err);
    }
    finally{
        if(connection)
        {
            try{
                connection.close();
            }
            catch(err){
                console.error(err);
            }
        }
    }

})

//save admin credentials into database
app.post('/changeAdminCredentials', async (req, res) => {
    const { adName, adMob, adEmail} = req.body;
    let updateFields = [];
    if (adName) {
        updateFields.push(`ad_name = '${adName}'`);
    }
    if (adMob) {
        updateFields.push(`ad_mobile = '${adMob}'`);
    }
    if (adEmail) {
        updateFields.push(`ad_email = '${adEmail}'`);
    }
    const updateQuery = `
        UPDATE institute 
        SET ${updateFields.join(', ')} 
        WHERE ins_email = '${instituteMail}'
    `;
    
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            updateQuery,{},
            { autoCommit: true }
        );
        res.send('Admin credentials updated successfully');
    } catch (err) {
        console.error('Error during update:', err);
        res.status(500).send('Error updating admin credentials');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
});

//function for admin login data fetch
app.get('/adminDetailsFetch',async (req,res)=>{
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`
            SELECT ad_name, ins_name, ad_email, ad_mobile FROM institute WHERE ad_email=:email`,
            {email: adminMail});
            console.log(result.rows[0]);
            res.json(result.rows[0]);
    }
    catch(err){
        console.error(err);
    }
    finally{
        if(connection)
        {
            try{
                connection.close();
            }
            catch(err){
                console.error(err);
            }
        }
    }

})

//student signup function
app.post('/studentSignup', async (req,res)=>{
    const {name,dob,scholarId,mobile,mail,pass}=req.body;
    console.log(name,dob,scholarId,mobile,mail,pass);
    // let connection;
    // try{
    //     connection=await oracledb.getConnection(dbConfig);
    //     await connection.execute(
    //         `INSERT INTO student (std_name,std_scholar,std_dob,std_mobile,std_gmail,std_pass,std_pic,std_doc) 
    //         VALUES (:name,:scholar,dob,mobile,gmail,pass,pic,doc)`,
    //         {name, scholarId, dob, mobile, mail, pass, pic, doc},
    //     {autoCommit: true})
    //     res.send('Record Saved Successfully')
    // }
    // catch(err){
    //     console.log(err);
    // }
    // finally{
    //     try{
    //         if(connection)
    //             connection.close();
    //     }
    //     catch(err){
    //         console.log(err);
    //     }
    // }
})

app.listen(3000,()=>{
    console.log('Server running at http://localhost:3000')
})
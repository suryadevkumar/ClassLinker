import express from 'express';
import oracledb from 'oracledb';
import path from 'path';
import multer from 'multer';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import session from 'express-session';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer();

app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 60 * 60 * 1000 }
}));

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//file connection
app.use(express.static(path.join(__dirname, '/')));

//generate OTP
function generateOTP()
{
    return Math.floor(1000+Math.random()*9000).toString();
}
let otp1='10000';
let otp2='10000';
let connection;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

//institute signup
//check email are in used or not
app.post('/checkEmailUsed',async(req,res)=>{
    const {instMail, adMail}=req.body;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result1=await connection.execute(`SELECT COUNT(ins_id) FROM institute WHERE ins_email=:gmail`,{gmail:instMail});
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
app.post('/sendInsEmail', (req, res) => {
    let { email } = req.body;
    if (!email) {
        email = req.session.instituteMail;
    }
    req.session.instituteMail=email;
    otp1=generateOTP();
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
            return res.send('OTP Sent Successfully!');
        }
    });
});

//send OTP to admin email
app.post('/sendAdEmail', (req, res) => {
    const { email } = req.body;
    otp2=generateOTP();
    const mailOptions = {
        from: process.env.EMAIL_USER,
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

//institute signup Routes
app.post('/instituteSignup',upload.single('photo'), async(req,res)=>{
    const{insName, insCode, insMob, insMail, insAddress, adName, adMob, adMail, pass}=req.body;
    const adminPic=req.file?.buffer;
    const hashPass= await bcrypt.hash(pass,10);
    ;
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

//admin login Routes
app.post('/adminLogin',async (req,res)=>{
    const {adMail, pass}=req.body;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT ins_pass FROM institute WHERE ad_email=:adMail`,{adMail: adMail});
        if(result.rows[0])
        {
            if(await bcrypt.compare(pass,result.rows[0][0])){
                req.session.adminMail=adMail;
                res.send('true');
            }
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
app.post('/insLogin',async (req,res)=>{
    let {insMail, pass}=req.body;
    if(!insMail){
        insMail=req.session.instituteMail;
    }
    ;
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

//Routes for institute data fetch
app.get('/insDetailsFetch',async (req,res)=>{
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`
            SELECT ins_name, ins_code, ins_email, ins_mobile, ad_email, ins_id FROM institute WHERE ins_email=:email`,
            {email: req.session.instituteMail});
            req.session.adminMail=result.rows[0][4];
            req.session.inst_id=result.rows[0][5];
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

//Routes for admin credentials data fetch
app.get('/fetchAdminCredentials',async (req,res)=>{
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`
            SELECT ad_name, ad_email, ad_mobile, ad_pic FROM institute WHERE ad_email=:email`,
            {email: req.session.adminMail});
        const [adName, adEmail, adMob, adPic]=result.rows[0];
        const handleLob = (adPic) => {
            return new Promise((resolve, reject) => {
                let chunks = [];
                adPic.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                adPic.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64AdPic = buffer.toString('base64');
                    resolve(base64AdPic);
                });

                adPic.on('error', (err) => {
                    console.error('LOB streaming error:', err);
                    reject(err);
                });
            });
        };

        const base64AdPic = await handleLob(adPic);
        res.json({
            ad_name: adName,
            ad_email: adEmail,
            ad_mobile: adMob,
            ad_pic: base64AdPic
        });
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

//update/reset password for admin/institute
app.post('/updateInsPassword',async (req,res)=>{
    let { insMail, pass } = req.body;
    if(!insMail){
        insMail=req.session.instituteMail;
    }
    ;
    const hashPass = await bcrypt.hash(pass, 10);
    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `UPDATE institute SET ins_pass= :hashpass WHERE ins_email=:insMail`,
            {hashPass, insMail},
            { autoCommit: true });

        res.send('Password Changed Successful');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during signup.");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
})

//save admin credentials into database
app.post('/changeAdminCredentials', upload.single('photo'), async (req, res) => {
    const { adName, adMob, adEmail} = req.body;
    const adminPic=req.file?.buffer;
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
    if (adminPic) {
        updateFields.push('ad_pic = :adPic');
    }
    const updateQuery = `
        UPDATE institute 
        SET ${updateFields.join(', ')} 
        WHERE ins_email = '${req.session.instituteMail}'
    `;
    
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const adPhoto = adminPic ? { adPic: { val: adminPic, type: oracledb.BLOB } } : {};
        await connection.execute(
            updateQuery,adPhoto,
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

//Routes for admin login data fetch
app.get('/adminDetailsFetch', async (req, res) => {
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT ad_name, ins_name, ad_email, ad_mobile, ad_pic, ins_id FROM institute WHERE ad_email = :email`,
            { email: req.session.adminMail }
        );

        const [adName, insName, adEmail, adMobile, adPic, insId] = result.rows[0];
        req.session.inst_id=insId;

        const handleLob = (adPic) => {
            return new Promise((resolve, reject) => {
                let chunks = [];
                adPic.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                adPic.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64AdPic = buffer.toString('base64');
                    resolve(base64AdPic);
                });

                adPic.on('error', (err) => {
                    console.error('LOB streaming error:', err);
                    reject(err);
                });
            });
        };

        const base64AdPic = await handleLob(adPic);

        res.json({
            ad_name: adName,
            ins_name: insName,
            ad_email: adEmail,
            ad_mobile: adMobile,
            ad_pic: base64AdPic
        });
    } catch (err) {
        console.error('Error fetching admin details:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
});

//Routes to fetch department
app.get('/getDepartments', async (req, res) => {
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT DISTINCT dep_id AS id, dep_name AS name FROM class_view WHERE ins_id = :inst_id`,
            { inst_id: req.session.inst_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching departments');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to fetch course
app.get('/getCourses', async (req, res) => {
    const { departmentId } = req.query;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT DISTINCT crs_id AS id, crs_name AS name FROM class_view WHERE dep_id = :dep_id`,
            { dep_id: departmentId }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching courses');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to fetch class
app.get('/getClasses', async (req, res) => {
    const { courseId } = req.query;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT cls_id AS id, cls_name AS name FROM class_view WHERE crs_id = :crs_id`,
            { crs_id: courseId }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching classes');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to add new class
app.post('/addClass', upload.none(), async (req, res) => {
    const { department, newDep, course, newCrs, className, sectionNum } = req.body;
    console.log(department, newDep, course, newCrs, className, sectionNum);
    ;
    let dep_id = 0;
    let crs_id = 0;

    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(`
            INSERT INTO class (cls_id, cls_name, section)
            VALUES (cls_id_seq.nextVal, :className, :sectionNum)
        `, { className, sectionNum }, { autoCommit: false });

        if (newDep !== "") {
            await connection.execute(`
                INSERT INTO department (dep_id, dep_name)
                VALUES (dep_id_seq.nextVal, :newDep)
            `, { newDep }, { autoCommit: false });

            const depResult = await connection.execute(`SELECT dep_id_seq.currVal FROM DUAL`);
            dep_id = depResult.rows[0][0];
        } else {
            dep_id = department;
        }
        if (newCrs !== "") {
            await connection.execute(`
                INSERT INTO course (crs_id, crs_name)
                VALUES (crs_id_seq.nextVal, :newCrs)
            `, { newCrs }, { autoCommit: false });

            const crsResult = await connection.execute(`SELECT crs_id_seq.currVal FROM DUAL`);
            crs_id = crsResult.rows[0][0];
        } else {
            crs_id = course;
        }
        await connection.execute(`
            INSERT INTO idcc (idcc_id, ins_id, dep_id, crs_id, cls_id)
            VALUES (idcc_id_seq.nextVal, :inst_id, :dep_id, :crs_id, cls_id_seq.currVal)
        `, { inst_id: req.session.inst_id, dep_id, crs_id }, { autoCommit: true });

        res.send("Class Added Successfully!");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding class");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to show class list
app.post('/getClassList',async(req,res)=>{
    const {dep, crs, cls}=req.body;
    let condition=`ins_id=${req.session.inst_id}`;
    if(dep)
    {
        condition+=` AND dep_id= ${dep}`;
    }
    if(crs)
    {
        condition+=` AND crs_id= ${crs}`;
    }
    if(cls)
    {
        condition+=` AND cls_id= ${cls}`;
    }
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result=await connection.execute(`
            SELECT DISTINCT dep_name, crs_name, cls_name, idcc_id FROM class_view where ${condition}`
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding class");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//Routes to get class details
app.post('/getClassDetails',async(req,res)=>{
    const {idcc_id}=req.body;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result=await connection.execute(`SELECT DISTINCT dep_name, crs_name, cls_name FROM class_view where idcc_id=:idcc_id`,{idcc_id});
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding class");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//Routes to show subject list
app.post('/getSubjectList',async(req,res)=>{
    const {idcc_id}=req.body;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result=await connection.execute(`
            SELECT DISTINCT sub_id, sub_name, tch_name, tch_id FROM subject_view where idcc_id=:idcc_id`,
            {idcc_id: idcc_id}
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading subject");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//Routes to add new subject
app.post('/addSubject', upload.none(), async (req, res) => {
    const { idcc_id, subjectName, teacherId } = req.body;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(`
            INSERT INTO subject (sub_id, sub_name, idcc_id, tch_id)
            VALUES (sub_id_seq.nextVal, :subjectName, :idcc_id, :teacherId)
        `, { subjectName, idcc_id, teacherId}, { autoCommit: true });
        res.send("success");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding class");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to update subject
app.post('/updateSubject', upload.none(), async (req, res) => {
    const { subject_id, subjectName, teacherId } = req.body;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(`
            UPDATE subject SET sub_name=:subjectName, tch_id=:teacherId WHERE sub_id=:subject_id
        `, { subjectName, teacherId, subject_id }, { autoCommit: true });
        res.send("success");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding class");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to delete subject
app.post('/deleteSubject', async(req, res)=>{
    const{subject_id}=req.body;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(`DELETE FROM subject WHERE sub_id=:subject_id`, {subject_id}, { autoCommit: true });
        res.send("success");
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//Routes to show student list
app.post('/getStudentList',async(req,res)=>{
    const {dep, crs, cls}=req.body;
    let condition=`ins_id=${req.session.inst_id}`;
    if(dep)
    {
        condition+=` AND dep_id= ${dep}`;
    }
    if(crs)
    {
        condition+=` AND crs_id= ${crs}`;
    }
    if(cls)
    {
        condition+=` AND cls_id= ${cls}`;
    }
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(`
            SELECT DISTINCT sch_id, std_name, dep_name, crs_name, cls_name FROM student_view 
            WHERE ins_id = :ins_id AND dep_id = :dep AND crs_id = :crs AND cls_id = :cls AND verified=1
            ORDER BY sch_id ASC
        `, { ins_id: req.session.inst_id, dep: dep, crs: crs, cls: cls });        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding class");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//Routes to show teacher list
app.get('/getTeacherList',async(req,res)=>{
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(`
            SELECT DISTINCT tch_id, tch_code, tch_name FROM teacher WHERE ins_id = :ins_id`, { ins_id: req.session.inst_id });        
        res.json(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//Routes to show unverified teacher list
app.get('/teacherUnverifiedList', async (req, res) => {
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT tch_id, tch_name, tch_pic FROM teacher WHERE ins_id = :inst_id AND verified = 0`,
            { inst_id: req.session.inst_id }
        );

        const rows = result.rows;

        const handleLob = (lob) => {
            return new Promise((resolve, reject) => {
                let chunks = [];
                lob.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                lob.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64Pic = buffer.toString('base64');
                    resolve(base64Pic);
                });

                lob.on('error', (err) => {
                    console.error('LOB streaming error:', err);
                    reject(err);
                });
            });
        };

        const teachersWithPics = await Promise.all(rows.map(async (row) => {
            const [tchId, tchName, tchPic] = row;

            const base64Pic = await handleLob(tchPic);

            return {
                tch_id: tchId,
                tch_name: tchName,
                tch_pic: base64Pic
            };
        }));

        res.json(teachersWithPics);

    } catch (err) {
        console.error('Error fetching teacher unverified list:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
});

//Routes to show unverified student list
app.get('/studentUnverifiedList', async (req, res) => {
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT std_id, std_name, std_pic FROM student_view WHERE ins_id=:inst_id AND verified = 0`,
            {inst_id: req.session.inst_id});

        const rows = result.rows;

        const handleLob = (lob) => {
            return new Promise((resolve, reject) => {
                let chunks = [];
                lob.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                lob.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64Pic = buffer.toString('base64');
                    resolve(base64Pic);
                });

                lob.on('error', (err) => {
                    console.error('LOB streaming error:', err);
                    reject(err);
                });
            });
        };

        const studentsWithPics = await Promise.all(rows.map(async (row) => {
            const [stdId, stdName, stdPic] = row;

            const base64Pic = await handleLob(stdPic);

            return {
                std_id: stdId,
                std_name: stdName,
                std_pic: base64Pic
            };
        }));

        res.json(studentsWithPics);

    } catch (err) {
        console.error('Error fetching student unverified list:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
});

//Routes to verification of teacher
app.post('/teacherVerification', async(req, res)=>{
    const {tch_id, status}=req.body;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        if(status=='accept'){
            await connection.execute(`UPDATE teacher SET verified=1 WHERE tch_id=:tch_id`,
                {tch_id: tch_id}, {autoCommit: true}
            )
        }
        else{
            await connection.execute(`UPDATE teacher SET verified=2 WHERE tch_id=:tch_id`,
                {tch_id: tch_id}, {autoCommit: true}
            )
        }
    }
    catch(err){
        console.error(err);
    }
    finally{
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//Routes to verification of student
app.post('/studentVerification', async(req, res)=>{
    const {std_id, status}=req.body;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        if(status=='accept'){
            await connection.execute(`UPDATE student SET verified=1 WHERE std_id=:std_id`,
                {std_id: std_id}, {autoCommit: true}
            )
        }
        else{
            await connection.execute(`UPDATE student SET verified=2 WHERE std_id=:std_id`,
                {std_id: std_id}, {autoCommit: true}
            )
        }
    }
    catch(err){
        console.error(err);
    }
    finally{
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
})

//student signup
//Routes to fetch institute list
app.get('/getInstitute', async (req, res) => {
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT DISTINCT ins_id AS id, ins_name AS name FROM institute`);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching departments');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to fetch department
app.get('/getDepList', async (req, res) => {
    const { instId } = req.query;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT DISTINCT dep_id AS id, dep_name AS name FROM class_view WHERE ins_id = :ins_id`,
            { ins_id: instId }
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching courses');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to fetch class
app.get('/getSections', async (req, res) => {
    const { clsId } = req.query;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT section FROM class_view WHERE cls_id = :cls_id`,
            { cls_id: clsId }
        );
        res.json(result.rows[0][0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching classes');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//check student email in used or not
app.post('/checkStdEmailUsed',async(req,res)=>{
    const{stdMail}=req.body;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT COUNT(std_id) FROM student WHERE std_email=:email`,{email:stdMail});
        const count = result.rows[0][0];
        if(count>0)
            res.send('yes');
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

//send otp to stdent email
app.post('/sendStdEmail', (req, res) => {
    let { email } = req.body;
    otp1=generateOTP();
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
            return res.send('OTP Sent Successfully!');
        }
    });
});

//verify student otp
app.post('/verifyOTP3',(req,res)=>{
    const {stdOTP}=req.body;
    if(stdOTP==otp1)
        res.send('true');
    else
    res.send('false');
})

//student signup Routes
app.post('/studentSignup', upload.fields([{ name: 'photo' }, { name: 'receipt' }]), async (req, res) => {
    const { stdName, stdDob, scholarId, stdMob, stdMail, college, department, course, cls, section, pass } = req.body;
    
    const stdPic = req.files?.photo?.[0]?.buffer;
    const receipt = req.files?.receipt?.[0]?.buffer;
    const hashPass = await bcrypt.hash(pass, 10);
    const verified=0;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(`
            SELECT idcc_id FROM idcc WHERE ins_id=:college AND dep_id=:department AND crs_id=:course AND cls_id=:cls`,
            { college, department, course, cls });

        const idccId = result.rows[0][0];

        await connection.execute(
            `INSERT INTO student (std_id, std_name, std_dob, sch_id, std_mobile, std_email, std_pass, section, idcc_id, verified, std_pic, std_doc)VALUES 
            (std_id_seq.NEXTVAL, :stdName, TO_DATE(:stdDob, 'YYYY-MM-DD'), :scholarId, :stdMob, :stdMail, :hashPass, :section, :idccId, :verified, :stdPic, :stdDoc)`,
            {
                stdName, stdDob, scholarId, stdMob, stdMail, hashPass, section, idccId, verified,
                stdPic: { val: stdPic, type: oracledb.BLOB },
                stdDoc: { val: receipt, type: oracledb.BLOB }
            },
            { autoCommit: true });

        res.send('Signup Successful');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during signup.");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
});

//Routes to student login
app.post('/studentLogin',async (req,res)=>{
    let {stdMail, pass}=req.body;
    if(!stdMail){
        stdMail=req.session.studentMail;
    }
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT std_pass FROM student WHERE std_email=:stdMail`,{stdMail: stdMail});
        if(result.rows[0]){
            if(await bcrypt.compare(pass,result.rows[0][0])){
                req.session.studentMail = stdMail;
                res.send('true');
            }
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

//Routes for student dashboard data fetch
app.get('/studentDetailsFetch', async (req, res) => {
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT std_id, std_name, sch_id, std_email, std_mobile, std_pic, idcc_id, verified FROM student WHERE std_email = :email`,
            { email: req.session.studentMail }
        );
        
        const [stdId, stdName, schid, stdEmail, stdMobile, stdPic, idcc, verified] = result.rows[0];
        req.session.idcc_id1 = idcc;
        req.session.std_id = stdId;
        req.session.userID1 = stdId;
        req.session.userName1 = stdName;
        const result1 = await connection.execute(
            `SELECT ins_name, dep_name, crs_name, cls_name, section FROM class_view WHERE idcc_id = :idcc`,
            { idcc: idcc }
        );

        const [insName, depName, crsName, clsName, sec] = result1.rows[0];

        const handleLob = (stdPic) => {
            return new Promise((resolve, reject) => {
                let chunks = [];
                stdPic.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                stdPic.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64AdPic = buffer.toString('base64');
                    resolve(base64AdPic);
                });

                stdPic.on('error', (err) => {
                    console.error('LOB streaming error:', err);
                    reject(err);
                });
            });
        };

        const base64AdPic = await handleLob(stdPic);

        res.json({
            std_id: stdId,
            std_name: stdName,
            sch_id: schid,
            std_email: stdEmail,
            std_mobile: stdMobile,
            std_pic: base64AdPic,
            ins_name: insName,
            dep_name: depName,
            crs_name: crsName,
            cls_name: clsName,
            section: sec,
            verified: verified
        });
    } catch (err) {
        console.error('Error fetching admin details:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
});

//update/reset password for student
app.post('/updateStdPassword',async (req,res)=>{
    let { stdMail, pass } = req.body;
    if(!stdMail){
        stdMail=req.session.studentMail;
    }
    ;
    const hashPass = await bcrypt.hash(pass, 10);
    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `UPDATE student SET std_pass= :hashpass WHERE std_email=:stdMail`,
            {hashPass, stdMail},
            { autoCommit: true });

        res.send('Password Changed Successful');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during signup.");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
})

//teacher Routes
//check teacher email in used or not
app.post('/checkTchEmailUsed',async(req,res)=>{
    const{tchMail}=req.body;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT COUNT(tch_id) FROM teacher WHERE tch_email=:email`,{email:tchMail});
        const count = result.rows[0][0];
        if(count>0)
            res.send('yes');
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
});

//send otp to teacher email
app.post('/sendTchEmail', (req, res) => {
    let { email } = req.body;
    otp2=generateOTP();
    const mailOptions = {
        from: process.env.EMAIL_USER,
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
            return res.send('OTP Sent Successfully!');
        }
    });
});

//verify teacher otp
app.post('/verifyOTP4',(req,res)=>{
    const {tchOTP}=req.body;
    if(tchOTP==otp2)
        res.send('true');
    else
    res.send('false');
})

//teacher signup Routes
app.post('/teacherSignup',upload.single('photo'), async(req,res)=>{
    const{tchName, tchCode, tchMob, tchMail, college, pass}=req.body;
    const tchPic=req.file?.buffer;
    const hashPass= await bcrypt.hash(pass,10);
    const verified=0;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        connection.execute(
            `INSERT INTO teacher (tch_id, tch_name, tch_code, tch_email, tch_mobile, tch_pass, ins_id, verified, tch_pic)
            VALUES (tch_id_seq.NEXTVAL, :tchName, :tchCode, :tchMail, :tchMob, :hashPass, :college, :verified, :tchPic)`,
        {tchName,tchCode, tchMail, tchMob, hashPass, college, verified, tchPic: { val: tchPic, type: oracledb.BLOB }},
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

//Routes to teacher login
app.post('/teacherLogin',async (req,res)=>{
    let {tchMail, pass}=req.body;
    if(!tchMail){
        tchMail=req.session.teacherMail;
    }
    req.session.teacherMail=tchMail;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT tch_pass FROM teacher WHERE tch_email=:tchMail`,{tchMail: tchMail});
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

//Routes for teacher dashboard data fetch
app.get('/teacherDetailsFetch', async (req, res) => {
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT tch_id, tch_name, tch_code, tch_email, tch_mobile, tch_pic, ins_id, verified FROM teacher WHERE tch_email = :email`,
            { email: req.session.teacherMail }
        );
        
        const [tch_id, tchName, tchId, tchEmail, tchMobile, tchPic, insId, verified] = result.rows[0];
        req.session.teacher_id=tch_id;
        req.session.userID=tch_id;
        req.session.userName=tchName;
        const result1 = await connection.execute(
            `SELECT ins_name FROM institute WHERE ins_id = :insId`,
            { insId: insId }
        );

        const insName = result1.rows[0];

        const handleLob = (tchPic) => {
            return new Promise((resolve, reject) => {
                let chunks = [];
                tchPic.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                tchPic.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64AdPic = buffer.toString('base64');
                    resolve(base64AdPic);
                });

                tchPic.on('error', (err) => {
                    console.error('LOB streaming error:', err);
                    reject(err);
                });
            });
        };

        const base64AdPic = await handleLob(tchPic);

        res.json({
            user_id: tch_id,
            tch_name: tchName,
            tch_id: tchId,
            tch_email: tchEmail,
            tch_mobile: tchMobile,
            tch_pic: base64AdPic,
            ins_name: insName,
            verified: verified
        });
    } catch (err) {
        console.error('Error fetching admin details:', err);
        res.status(500).json({ message: 'Internal server error' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error closing connection:', closeErr);
            }
        }
    }
});

//update/reset password for teacher
app.post('/updateTchPassword',async (req,res)=>{
    let { tchMail, pass } = req.body;
    if(!tchMail){
        tchMail=req.session.teacherMail;
    }
    ;
    const hashPass = await bcrypt.hash(pass, 10);
    try {
        connection = await oracledb.getConnection(dbConfig);

        await connection.execute(
            `UPDATE teacher SET tch_pass= :hashpass WHERE tch_email=:tchMail`,
            {hashPass, tchMail},
            { autoCommit: true });

        res.send('Password Changed Successful');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error during signup.");
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
})

//load subject list in select box
app.get('/subList',async(req, res)=>{
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT sub_id, dep_name, crs_name, cls_name, sub_name FROM subject_view WHERE tch_id=:tchId`,{tchId: req.session.teacher_id});
        res.json(result.rows);
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

//Routes to find subject details
app.post('/getSubDetails',async(req,res)=>{
    const {sub_id}=req.body;
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT dep_name, crs_name, cls_name, sub_name, idcc_id FROM subject_view WHERE sub_id=:subId`,{subId: sub_id});
        req.session.idcc_id=result.rows[0][4];
        res.json(result.rows);
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

//Routes to load student details for attendance
app.get('/getStudentDetails',async(req,res)=>{
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT std_id, sch_id, std_name, std_pic FROM student WHERE verified=1 AND idcc_id=:idccId`,{idccId: req.session.idcc_id});
        const rows = result.rows;

        const handleLob = (lob) => {
            return new Promise((resolve, reject) => {
                let chunks = [];
                lob.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                lob.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const base64Pic = buffer.toString('base64');
                    resolve(base64Pic);
                });

                lob.on('error', (err) => {
                    console.error('LOB streaming error:', err);
                    reject(err);
                });
            });
        };

        const studentsWithPics = await Promise.all(rows.map(async (row) => {
            const [stdId, schId, stdName, stdPic] = row;

            const base64Pic = await handleLob(stdPic);

            return {
                std_id: stdId,
                sch_id: schId,
                std_name: stdName,
                std_pic: base64Pic
            };
        }));

        res.json(studentsWithPics);
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

//Routes to get attendance status
app.post('/getAttendanceStats', async (req, res) => {
    const { std_id, sub_id } = req.body;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);
        
        const totalClassesResult = await connection.execute(
            `SELECT COUNT(*) AS total_classes 
            FROM attendance 
            WHERE sub_id = :sub_id AND std_id= :std_id`,
            { sub_id: sub_id, std_id: std_id }
        );
        
        const totalPresentResult = await connection.execute(
            `SELECT COUNT(*) AS total_present 
            FROM attendance 
            WHERE sub_id = :sub_id 
            AND std_id = :std_id 
            AND attend_status = 'Present'`,
            {
                sub_id: sub_id,
                std_id: std_id
            }
        );

        res.json({
            totalClasses: totalClassesResult.rows[0][0],
            totalPresent: totalPresentResult.rows[0][0]
        });
    } catch (err) {
        console.error('Error fetching attendance stats:', err);
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

//fucntion to mark attendance
app.post('/markAttendance', async (req, res) => {
    const { std_id, sub_id, status } = req.body;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);
        await connection.execute(
            `INSERT INTO attendance (attend_id, attend_date, attend_status, std_id, sub_id)
            VALUES (attend_id_seq.NEXTVAL, SYSDATE, :status, :std_id, :sub_id)`,
            {
                status: status,
                std_id: std_id,
                sub_id: sub_id
            },
            { autoCommit: true }
        );
    } catch (err) {
        console.error('Error executing query:', err);
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

//update status of attendance
app.post('/updateAttendance', async (req, res) => {
    const { std_id, sub_id, status } = req.body;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        const result=await connection.execute(
            `UPDATE attendance 
            SET attend_status = :status 
            WHERE std_id = :std_id 
            AND sub_id = :sub_id 
            AND TRUNC(attend_date) = TRUNC(SYSDATE)`,
            {
                status: status,
                std_id: std_id,
                sub_id: sub_id
            },
            { autoCommit: true }
        );
    } catch (err) {
        console.error('Error updating attendance:', err);
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

//notes
//Routes to load notes
app.post('/getNotesList', async (req, res) => {
    const { sub_id } = req.body;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT notes_id, notes_name FROM notes WHERE sub_id = :subId`,
            { subId: sub_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching notes:', err);
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

//Routes to upload notes
app.post('/uploadNotes', upload.single('notesFile'), async (req, res) => {
    const { notesTitle, sub_id } = req.body;
    const notesFile = req.file?.buffer;
    const fileType = req.file?.mimetype;

    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `INSERT INTO notes (notes_id, notes_name, notes_file, file_type, sub_id) 
             VALUES (notes_id_seq.NEXTVAL, :notesTitle, :notesFile, :fileType, :sub_id)`, {
            notesTitle: notesTitle,
            notesFile: { val: notesFile, type: oracledb.BLOB },
            fileType: fileType,
            sub_id: sub_id
        }, { autoCommit: true });

        res.json({ success: true });
    } catch (err) {
        console.error('Error uploading note:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//download notes
app.get('/downloadNote/:noteId', async (req, res) => {
    const { noteId } = req.params;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT notes_name, notes_file, file_type FROM notes WHERE notes_id = :noteId`,
            { noteId: noteId }
        );

        const note = result.rows[0];
        const fileName = note[0];
        const fileData = note[1];
        const fileType = note[2];

        if (fileData) {
            const buffer = await fileData.getData();
            res.setHeader('Content-Type', fileType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(buffer);
        } else {
            return res.status(500).send('File data is missing or corrupted');
        }
    } catch (err) {
        console.error('Error downloading file:', err);
        return res.status(500).send('Internal server error');
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing database connection:', err);
            }
        }
    }
});

//delete notes
app.delete('/deleteNote/:noteId', async (req, res) => {
    const { noteId } = req.params;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `DELETE FROM notes WHERE notes_id = :noteId`,
            { noteId: noteId },
            { autoCommit: true }
        );
        res.send('Note deleted successfully');
    } catch (err) {
        console.error('Error deleting note:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//assignment
//Routes to load assignment
app.post('/getAssignmentList', async (req, res) => {
    const { sub_id } = req.body;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT as_id, as_name FROM assignment WHERE sub_id = :subId`,
            { subId: sub_id }
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching assignment:', err);
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

//Routes to upload assignment
app.post('/uploadAssignment', upload.single('assignmentFile'), async (req, res) => {
    const { assignmentTitle, sub_id } = req.body;
    const assignmentFile = req.file?.buffer;
    const fileType = req.file?.mimetype;

    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `INSERT INTO assignment (as_id, as_name, as_file, file_type, sub_id) 
             VALUES (assignment_id_seq.NEXTVAL, :assignmentTitle, :assignmentFile, :fileType, :sub_id)`, {
            assignmentTitle: assignmentTitle,
            assignmentFile: { val: assignmentFile, type: oracledb.BLOB },
            fileType: fileType,
            sub_id: sub_id
        }, { autoCommit: true });

        res.json({ success: true });
    } catch (err) {
        console.error('Error uploading assignment:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//download assignment
app.get('/downloadAssignment/:assignId', async (req, res) => {
    const { assignId } = req.params;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `SELECT as_name, as_file, file_type FROM assignment WHERE as_id = :assignId`,
            { assignId: assignId }
        );

        const assignment = result.rows[0];
        const fileName = assignment[0];
        const fileData = assignment[1];
        const fileType = assignment[2];

        if (fileData) {
            const buffer = Buffer.isBuffer(fileData) ? fileData : await fileData.getData();
            res.setHeader('Content-Type', fileType);
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.send(buffer);
        } else {
            return res.status(500).send('File data is missing or corrupted');
        }
    } catch (err) {
        console.error('Error downloading file:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing database connection:', err);
            }
        }
    }
});

//delete assignment
app.delete('/deleteAssignment/:assignmentId', async (req, res) => {
    const { assignmentId } = req.params;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            `DELETE FROM assignment WHERE as_id = :assignmentId`,
            { assignmentId: assignmentId },
            { autoCommit: true }
        );
        res.send('Assignment deleted successfully');
    } catch (err) {
        console.error('Error deleting assignment:', err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to load subject list in student dashboard
app.get('/subList1',async(req, res)=>{
    ;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT sub_id, sub_name FROM subject WHERE idcc_id=:idccId`,{idccId: req.session.idcc_id1});
        res.json(result.rows);
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

//Routes to load student attendance sheet and status for student view
app.post('/getAttendanceDetails', async (req, res) => {
    const { sub_id } = req.body;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);
        const result=await connection.execute(
            `SELECT TO_CHAR(ATTEND_DATE, 'DD/MM/YYYY') AS attend_date, attend_status 
            FROM attendance 
            WHERE sub_id = :sub_id AND std_id= :std_id`,
            { sub_id: sub_id, std_id: req.session.std_id }
        );

        const totalClassesResult = await connection.execute(
            `SELECT COUNT(*) AS total_classes 
            FROM attendance 
            WHERE sub_id = :sub_id AND std_id= :std_id`,
            { sub_id: sub_id, std_id: req.session.std_id }
        );
        
        const totalPresentResult = await connection.execute(
            `SELECT COUNT(*) AS total_present 
            FROM attendance 
            WHERE sub_id = :sub_id 
            AND std_id = :std_id 
            AND attend_status = 'Present'`,
            {
                sub_id: sub_id,
                std_id: req.session.std_id
            }
        );

        res.json({
            attendences: result.rows,
            totalClasses: totalClassesResult.rows[0][0],
            totalPresent: totalPresentResult.rows[0][0]
        });
    } catch (err) {
        console.error('Error fetching attendance stats:', err);
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

//chat
//Routes to load chats
app.post('/getchats', async (req, res) => {
    const {sub_id}=req.body;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
            SELECT user_id, user_name, message,TO_CHAR(time, 'DD-MM-YYYY HH:MI AM') AS time FROM chat WHERE sub_id=:sub_id order by chat_id`,
        {sub_id: sub_id});
        res.json(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to send message
app.post('/sendMessage', async (req, res) => {
    const {sub_id, message} = req.body;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result=await connection.execute(
            `INSERT INTO chat (chat_id, user_id, user_name, sub_id, message, time) VALUES 
            (chat_id_seq.NEXTVAL,:userID, :userName, :sub_id, :message, SYSTIMESTAMP)`,
            {userID: req.session.userID, userName: req.session.userName, sub_id, message},
            { autoCommit: true });
        res.send('true');
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
});

//Routes to load chats student
app.post('/getchats1', async (req, res) => {
    const {sub_id}=req.body;
    ;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
            SELECT user_id, user_name, message,TO_CHAR(time, 'DD-MM-YYYY HH:MI AM') AS time FROM chat WHERE sub_id=:sub_id order by chat_id`,
        {sub_id: sub_id});
        res.json(result.rows);
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

//Routes to send message student
app.post('/sendMessage1', async (req, res) => {
    const {sub_id, message} = req.body;
    ;

    try {
        connection = await oracledb.getConnection(dbConfig);

        const result=await connection.execute(
            `INSERT INTO chat (chat_id, user_id, user_name, sub_id, message, time) VALUES 
            (chat_id_seq.NEXTVAL,:userID1, :userName1, :sub_id, :message, SYSTIMESTAMP)`,
            {userID1: req.session.userID1, userName1: req.session.userName1, sub_id, message},
            { autoCommit: true });
        res.send('true');
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
});

app.listen(3000,()=>{
    console.log('Server running at http://localhost:3000')
});
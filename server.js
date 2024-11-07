const express=require('express');
const oracledb=require('oracledb');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const fs = require('fs');

const app = express();
const upload = multer();

const dbConfig = {
    user: 'system',
    password: '0786',
    connectString: 'localhost:1521/orcl'
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//file connection
app.use(express.static(path.join(__dirname, '/')));

//send OTP to mail
function generateOTP()
{
    return Math.floor(1000+Math.random()*9000).toString();
}
let otp1='10000';
let otp2='10000';
let otp3='10000';
let otp4='10000';
let inst_id=100;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'suryadevkumar786786@gmail.com',
        pass: 'vgaj lkdh tgbx ephk'
    }
});

//institute signup

//check email are in used or not
app.post('/checkEmailUsed',async(req,res)=>{
    const{instMail, adMail}=req.body;
    let connection;
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
    const{insName, insCode, insMob, insMail, insAddress, adName, adMob, adMail, pass}=req.body;
    const adminPic=req.file?.buffer;
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
            SELECT ins_name, ins_code, ins_email, ins_mobile, ad_email, ins_id FROM institute WHERE ins_email=:email`,
            {email: instituteMail});
            adminMail=result.rows[0][4];
            inst_id=result.rows[0][5];
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
            SELECT ad_name, ad_email, ad_mobile, ad_pic FROM institute WHERE ad_email=:email`,
            {email: adminMail});
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
        WHERE ins_email = '${instituteMail}'
    `;
    console.log(adminPic);
    console.log(updateQuery);
    
    let connection;
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

//function for admin login data fetch
app.get('/adminDetailsFetch', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT ad_name, ins_name, ad_email, ad_mobile, ad_pic, ins_id FROM institute WHERE ad_email = :email`,
            { email: adminMail }
        );

        const [adName, insName, adEmail, adMobile, adPic, insId] = result.rows[0];
        inst_id=insId;

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

//function to fetch department
app.get('/getDepartments', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT DISTINCT dep_id AS id, dep_name AS name FROM class_view WHERE ins_id = :inst_id`,
            { inst_id }
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

//function to fetch course
app.get('/getCourses', async (req, res) => {
    const { departmentId } = req.query;
    let connection;
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

//function to fetch class
app.get('/getClasses', async (req, res) => {
    const { courseId } = req.query;
    let connection;
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

//function to add new class
app.post('/addClass', upload.none(), async (req, res) => {
    const { department, newDep, course, newCrs, className, sectionNum } = req.body;
    console.log(department, newDep, course, newCrs, className, sectionNum);
    let connection;
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
        console.log(dep_id,crs_id,inst_id);
        await connection.execute(`
            INSERT INTO idcc (idcc_id, ins_id, dep_id, crs_id, cls_id)
            VALUES (idcc_id_seq.nextVal, :inst_id, :dep_id, :crs_id, cls_id_seq.currVal)
        `, { inst_id, dep_id, crs_id }, { autoCommit: true });

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

//function to show class list
app.post('/getClassList',async(req,res)=>{
    const {dep, crs, cls}=req.body;
    let condition=`ins_id=${inst_id}`;
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

//function to get class details
app.post('/getClassDetails',async(req,res)=>{
    const {idcc_id}=req.body;
    let connection;
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

//function to show subject list
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

//function to add new subject
app.post('/addSubject', upload.none(), async (req, res) => {
    const { idcc_id, subjectName, teacherId } = req.body;
    let connection;
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

//function to update subject
app.post('/updateSubject', upload.none(), async (req, res) => {
    const { subject_id, subjectName, teacherId } = req.body;
    let connection;
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

//function to delete subject
app.post('/deleteSubject', async(req, res)=>{
    const{subject_id}=req.body;
    let connection;
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

//function to show student list
app.post('/getStudentList',async(req,res)=>{
    const {dep, crs, cls}=req.body;
    let condition=`ins_id=${inst_id}`;
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
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(`
            SELECT DISTINCT sch_id, std_name, dep_name, crs_name, cls_name FROM student_view 
            WHERE ins_id = :ins_id AND dep_id = :dep AND crs_id = :crs AND cls_id = :cls AND verified=1
            ORDER BY sch_id ASC
        `, { ins_id: inst_id, dep: dep, crs: crs, cls: cls });        
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

//function to show teacher list
app.get('/getTeacherList',async(req,res)=>{
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(`
            SELECT DISTINCT tch_id, tch_code, tch_name FROM teacher WHERE ins_id = :ins_id`, { ins_id: inst_id });        
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

//function to show unverified teacher list
app.get('/teacherUnverifiedList', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT tch_id, tch_name, tch_pic FROM teacher WHERE ins_id = :inst_id AND verified = 0`,
            { inst_id: inst_id }
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

//function to show unverified student list
app.get('/studentUnverifiedList', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT std_id, std_name, std_pic FROM student_view WHERE ins_id=:inst_id AND verified = 0`,
            {inst_id: inst_id});

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

//function to verification of teacher
app.post('/teacherVerification', async(req, res)=>{
    const {tch_id, status}=req.body;
    let connection;
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

//function to verification of student
app.post('/studentVerification', async(req, res)=>{
    const {std_id, status}=req.body;
    let connection;
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
//function to fetch institute list
app.get('/getInstitute', async (req, res) => {
    let connection;
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

//function to fetch department
app.get('/getDepList', async (req, res) => {
    const { instId } = req.query;
    let connection;
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

//function to fetch class
app.get('/getSections', async (req, res) => {
    const { clsId } = req.query;
    let connection;
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
    let connection;
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

//verify student otp
app.post('/verifyOTP3',(req,res)=>{
    const {stdOTP}=req.body;
    if(stdOTP==otp1)
        res.send('true');
    else
    res.send('false');
})

//student signup function
app.post('/studentSignup', upload.fields([{ name: 'photo' }, { name: 'receipt' }]), async (req, res) => {
    const { stdName, stdDob, scholarId, stdMob, stdMail, college, department, course, cls, section, pass } = req.body;
    
    const stdPic = req.files?.photo?.[0]?.buffer;
    const receipt = req.files?.receipt?.[0]?.buffer;
    const hashPass = await bcrypt.hash(pass, 10);
    const verified=0;
    let connection;

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

//function to student login
let studentMail='';
app.post('/studentLogin',async (req,res)=>{
    const {stdMail, pass}=req.body;
    studentMail=stdMail;
    let connection;
    try{
        connection=await oracledb.getConnection(dbConfig);
        const result=await connection.execute(`SELECT std_pass FROM student WHERE std_email=:stdMail`,{stdMail: stdMail});
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

//function for student dashboard data fetch
app.get('/studentDetailsFetch', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT std_name, sch_id, std_email, std_mobile, std_pic, idcc_id FROM student WHERE std_email = :email`,
            { email: studentMail }
        );
        
        const [stdName, schid, stdEmail, stdMobile, stdPic, idcc] = result.rows[0];
        
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
            std_name: stdName,
            sch_id: schid,
            std_email: stdEmail,
            std_mobile: stdMobile,
            std_pic: base64AdPic,
            ins_name: insName,
            dep_name: depName,
            crs_name: crsName,
            cls_name: clsName,
            section: sec
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

//teacher function
//check teacher email in used or not
app.post('/checkTchEmailUsed',async(req,res)=>{
    const{tchMail}=req.body;
    let connection;
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

//verify teacher otp
app.post('/verifyOTP4',(req,res)=>{
    const {tchOTP}=req.body;
    if(tchOTP==otp2)
        res.send('true');
    else
    res.send('false');
})

//teacher signup function
app.post('/teacherSignup',upload.single('photo'), async(req,res)=>{
    const{tchName, tchCode, tchMob, tchMail, college, pass}=req.body;
    const tchPic=req.file?.buffer;
    const hashPass= await bcrypt.hash(pass,10);
    const verified=0;
    let connection;
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

//function to teacher login
let teacherMail='';
app.post('/teacherLogin',async (req,res)=>{
    const {tchMail, pass}=req.body;
    teacherMail=tchMail;
    let connection;
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

//function for teacher dashboard data fetch
app.get('/teacherDetailsFetch', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(
            `SELECT tch_name, tch_code, tch_email, tch_mobile, tch_pic, ins_id FROM teacher WHERE tch_email = :email`,
            { email: teacherMail }
        );
        
        const [tchName, tchId, tchEmail, tchMobile, tchPic, insId] = result.rows[0];
        
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
            tch_name: tchName,
            tch_id: tchId,
            tch_email: tchEmail,
            tch_mobile: tchMobile,
            tch_pic: base64AdPic,
            ins_name: insName
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

app.listen(3000,()=>{
    console.log('Server running at http://localhost:3000')
});
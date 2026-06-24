const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');

// 确保 data 目录存在
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// 如果数据文件不存在，创建空数组
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

// 解析 JSON 请求体
app.use(express.json());

// 静态文件服务
app.use(express.static(__dirname));

// 接收报名表单提交
app.post('/api/submit', (req, res) => {
    const { parentName, phone, studentName, school, grade, subjects, notes } = req.body;

    // 验证必填字段
    if (!phone || !studentName) {
        return res.status(400).json({ success: false, message: '请至少填写联系电话和学生姓名' });
    }

    // 读取现有数据
    let submissions = [];
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        submissions = JSON.parse(raw);
    } catch (e) {
        submissions = [];
    }

    // 添加新记录
    const record = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        parentName: parentName || '',
        phone: phone || '',
        studentName: studentName || '',
        school: school || '',
        grade: grade || '',
        subjects: subjects || '',
        notes: notes || '',
        createdAt: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    };

    submissions.push(record);

    // 保存到文件
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf-8');

    res.json({ success: true, message: '提交成功！我们会尽快与您联系。' });
});

// 获取所有提交数据（供管理后台用）
app.get('/api/submissions', (req, res) => {
    const { pwd } = req.query;
    if (pwd !== 'tongtu2024') {
        return res.status(403).json({ success: false, message: '密码错误' });
    }

    let submissions = [];
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        submissions = JSON.parse(raw);
    } catch (e) {
        submissions = [];
    }

    // 按时间倒序
    submissions.reverse();

    res.json({ success: true, data: submissions });
});

// 启动服务
app.listen(PORT, '0.0.0.0', () => {
    console.log(`同途教育服务已启动: http://0.0.0.0:${PORT}`);
});

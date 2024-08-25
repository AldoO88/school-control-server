const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const signupController = async (req, res, next) => {
  try {
    const { name, lastname, profile, email, password } = req.body;

    if(name === '' || lastname === '' || profile === '' || email === '' || password === ''){
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailRegex.test(email)){
      return res.status(400).json({ message: 'El formato del correo no es valido' });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if(!passwordRegex.test(password)){
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número' });
    }

    const user = await User.findOne({ email })
    if(user){
      return res.status(400).json({ message: 'El correo ya esta registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const createedUser = await User.create({ name, lastname, profile, email, password: hashedPassword });
    const { email: savedEmail, name: savedName, _id } = createedUser;
    res.status(201).json({ message: 'Usuario creado exitosamente', user: {email: savedEmail, name: savedName, _id} });

  } catch (error) {
    if(error.code === 500){
      return res.status(500).json({ message: 'Error en el servidor' });
    }
  }
}

const loginController = async (req, res, next) => {
  try {
    const { password, email } = req.body;

    if(email === '' || password === ''){
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    } 

    const foundUser = await User.findOne({ email });
    if(!foundUser){
      return res.status(404).json({ message: 'El correo no esta registrado' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, foundUser.password);
    if(!isPasswordCorrect){
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const authToken = jwt.sign(
      { _id: foundUser._id, email: foundUser.email, name: foundUser.name, lastName: foundUser.lastname, profile: foundUser.profile },
      process.env.JWT_SECRET,
      { algorithm: 'HS256', expiresIn: '1h' }
    )

    res.status(200).json({ message: 'Inicio de sesión exitoso', token: authToken });
    
  } catch (error) {
    if(error.code === 500){
      return res.status(500).json({ message: 'Error en el servidor' });
    }
  }
}

const verifyController = async (req, res, next) => {
  console.log(req.payload);
  res.status(200).json(req.payload);
}


module.exports = { signupController, loginController, verifyController };
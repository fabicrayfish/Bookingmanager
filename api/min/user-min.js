var Schema = mongoose.Schema;

var userSchema = mongoose.model('User', new Schema({
  name: string,
  password: string,
  admin: boolean
}));



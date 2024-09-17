const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));
mongoose.connect("mongodb+srv://sher54085:m81bivdpRTiWNOQZ@cluster0.tfryl.mongodb.net/todolistDB");

const itemSchema = {
  name: String
}
 
const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
  name: "welcome to your todolist!"
});
const item2 = new Item ({
  name: "Hit the + button to add new item."
});
const item3 = new Item ({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema] 
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}).then((foundItems,err)=>{

    if(foundItems.length === 0){

      Item.insertMany(defaultItems);
      res.redirect("/");

    }

    else{

      res.render("list", {listTitle: "Today", newListItems: foundItems});   

    }
  });
});

app.post("/", function(req, res){

  const itemName =  req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name:itemName
  });

  if(listName === "Today"){  

    newItem.save().then(()=>{
      res.redirect("/");

    });
  }

  else{

    List.findOne({name:listName}).then((foundItems)=>{
      foundItems.items.push(newItem);
      foundItems.save();
      res.redirect("/"+listName); 

    });
  }
});

app.post("/delete",(req,res)=>{

  if(req.body.listName=== "Today"){

    Item.findOneAndDelete({ _id: req.body.checkbox}).then((err)=>{
      console.log(err);
  
    });
  
    res.redirect("/");
      
  }else{
    const id = req.body.checkbox;
    const listName = req.body.listName;
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}}).then(()=>{
      res.redirect("/"+listName); 
    });
  }
});

app.get("/:listId",(req,res)=>{
  const customListName = req.params.listId;

  List.findOne({name: customListName}).then((result)=>{

    if(!result){
        // create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/"+ customListName);

      }

      else{
        // show existing list
        res.render("list",{listTitle: result.name, newListItems: result.items});

      }
  });
});



app.get("/about", function(req, res){

  res.render("about");

});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

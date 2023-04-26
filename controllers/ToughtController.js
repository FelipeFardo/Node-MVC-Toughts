const Tought = require("../models/Tought");
const User = require("../models/User");

const { Op } = require("sequelize");

module.exports = class ToughtsController {
  static async showToughts(req, res) {
    let search = "";

    req.query.search ? (search = req.query.search) : (search = "");

    let order = "DESC";

    req.query.order === "old" ? (order = "ASC") : (order = "DESC");

    const toughtData = await Tought.findAll({
      include: User,
      where: {
        title: { [Op.like]: `%${search}%` },
      },
      order: [["createdAt", order]],
    });
    const toughts = toughtData.map((result) => result.get({ plain: true }));

    let toughtsQty = toughts.length;

    res.render("toughts/home", { toughts, search, toughtsQty });
  }
  
  static async dashboard(req, res) {
    const userId = req.session.userid;
    const user = await User.findOne({
      where: { id: userId },
      include: Tought,
      plain: true,
    });

    // check if user exists
    if (!user) {
      res.redirect("/login");
    }

    const toughts = user.Toughts.map((result) => result.dataValues);

    let emptyToughts = false;

    if (toughts.length === 0) emptyToughts = true;

    res.render("toughts/dashboard", { toughts, emptyToughts });
  }

  static createTought(req, res) {
    res.render("toughts/create");
  }

  static async createToughtSave(req, res) {
    const tought = {
      title: req.body.title,
      UserId: req.session.userid,
    };

    if (!tought.title.trim().length) {
      req.flash("message", "Pensamento não pode ser vazio!");
      res.render("toughts/create");
      return;
    }
    try {
      await Tought.create(tought);

      req.flash("message", "Pensamento criado com sucesso!");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.log(err);
    }
  }

  static async removeTought(req, res) {
    const id = req.body.id;
    const UserId = req.session.userid;
    try {
      await Tought.destroy({ where: { id, UserId } });
      req.flash("message", "Pensamento removido com sucesso!");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.log(err);
    }
  }

  static async updateTought(req, res) {
    const id = req.params.id;

    const tought = await Tought.findOne({ where: { id }, raw: true });

    res.render("toughts/edit", { tought });
  }

  static async updateToughtSave(req, res) {
    const id = req.body.id;

    const tought = {
      title: req.body.title,
    };

    try {
      await Tought.update(tought, { where: { id } });

      req.flash("message", "Pensamento atualizado com sucesso!");

      req.session.save(() => {
        res.redirect("/toughts/dashboard");
      });
    } catch (err) {
      console.log(err);
    }
  }
};

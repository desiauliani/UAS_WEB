exports.catalogPage = async (req, res) => {
    try {
        const { keyword, categoryId } = req.query; 
        let whereCondition = {};

        if (keyword) whereCondition.nama = { [Op.like]: `%${keyword}%` };
        
        if (categoryId) whereCondition.categoryId = categoryId; 

        const products = await Product.findAll({
            where: whereCondition,
            include: [{ model: Category, as: 'category' }]
        });
        const categories = await Category.findAll();

        res.render('customer/catalog', { 
            title: 'Katalog - Rhopaloceraz', 
            products, 
            categories, 
            keyword, 
            categoryId 
        });
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
};
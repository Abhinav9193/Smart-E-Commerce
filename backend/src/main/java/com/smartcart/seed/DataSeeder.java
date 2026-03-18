package com.smartcart.seed;

import com.smartcart.entity.Category;
import com.smartcart.entity.Product;
import com.smartcart.entity.User;
import com.smartcart.repository.CategoryRepository;
import com.smartcart.repository.ProductRepository;
import com.smartcart.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random(42);

    public DataSeeder(CategoryRepository categoryRepository, ProductRepository productRepository,
                      UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping...");
            return;
        }

        System.out.println("=== Starting data seeding ===");
        seedUsers();
        List<Category> categories = seedCategories();
        seedProducts(categories);
        System.out.println("=== Data seeding complete! ===");
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@smartcart.com")) {
            User admin = new User("admin@smartcart.com", passwordEncoder.encode("admin123"), "Admin User", User.Role.ADMIN);
            userRepository.save(admin);
            System.out.println("Admin user created: admin@smartcart.com / admin123");
        }

        if (!userRepository.existsByEmail("user@smartcart.com")) {
            User user = new User("user@smartcart.com", passwordEncoder.encode("user123"), "Test User", User.Role.USER);
            userRepository.save(user);
            System.out.println("Test user created: user@smartcart.com / user123");
        }
    }

    private List<Category> seedCategories() {
        String[][] categoryData = {
            {"Laptops", "High-performance laptops for work and play", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"},
            {"Keyboards", "Mechanical and membrane keyboards", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400"},
            {"Mouse", "Gaming and productivity mice", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400"},
            {"Headphones", "Over-ear and in-ear headphones", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"},
            {"Monitors", "High-resolution displays", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400"},
            {"Cameras", "DSLR and mirrorless cameras", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400"},
            {"Microphones", "Studio and USB microphones", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400"},
            {"Tripods", "Camera and phone tripods", "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400"},
            {"Lighting", "Ring lights and studio lighting", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400"},
            {"Webcams", "HD webcams for streaming", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400"},
            {"Tablets", "Drawing and productivity tablets", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400"},
            {"Speakers", "Bluetooth and desktop speakers", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400"},
            {"Gaming Chairs", "Ergonomic gaming seats", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400"},
            {"Office Chairs", "Comfortable office seating", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400"},
            {"Bags", "Backpacks and laptop bags", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400"},
            {"Books", "Technical and educational books", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400"},
            {"Desk Lamps", "LED desk and study lamps", "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400"},
            {"Power Banks", "Portable chargers", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400"},
            {"Watches", "Smartwatches and classic watches", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"},
            {"Shoes", "Sports and casual shoes", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"},
            {"Water Bottles", "Insulated and sports bottles", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400"},
            {"Stationery", "Pens, notebooks, and supplies", "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400"},
            {"Storage", "Organizers and storage boxes", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400"},
            {"Extension Cords", "Power strips and extensions", "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=400"},
            {"Fans", "Table and tower fans", "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400"},
            {"Mousepads", "Gaming and desk mousepads", "https://images.unsplash.com/photo-1616353071855-2c045c4458ae?w=400"},
            {"Fitness Bands", "Activity and health trackers", "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400"},
            {"Smartwatches", "Smart wearable devices", "https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400"},
            {"Sunglasses", "UV protection eyewear", "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400"},
            {"Kitchen Appliances", "Small kitchen electronics", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"},
            {"Cookware", "Pots, pans, and cookware sets", "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400"},
            {"Lenses", "Camera lenses", "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=400"},
            {"Memory Cards", "SD and micro SD cards", "https://images.unsplash.com/photo-1601737487795-dab272f52420?w=400"},
            {"Blenders", "Juicers and blenders", "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400"},
            {"Audio Interfaces", "USB audio recording interfaces", "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400"},
        };

        List<Category> categories = new ArrayList<>();
        for (String[] data : categoryData) {
            if (!categoryRepository.existsByName(data[0])) {
                Category category = new Category(data[0], data[1], data[2]);
                categories.add(categoryRepository.save(category));
            } else {
                categories.add(categoryRepository.findByName(data[0]).get());
            }
        }
        System.out.println("Created " + categories.size() + " categories");
        return categories;
    }

    private void seedProducts(List<Category> categories) {
        int totalProducts = 0;

        for (Category category : categories) {
            List<String[]> productTemplates = getProductTemplates(category.getName());
            int productsPerCategory = Math.max(80, productTemplates.size() * 8);

            for (int i = 0; i < productsPerCategory && totalProducts < 3200; i++) {
                String[] template = productTemplates.get(i % productTemplates.size());
                String variant = getVariant(i);
                String productName = template[0] + (i >= productTemplates.size() ? " " + variant : "");
                String description = template[1];
                String imageUrl = template[2];

                BigDecimal basePrice = new BigDecimal(template[3]);
                BigDecimal priceVariance = basePrice.multiply(BigDecimal.valueOf(0.3 * (random.nextDouble() - 0.5)));
                BigDecimal price = basePrice.add(priceVariance).setScale(2, RoundingMode.HALF_UP);
                if (price.compareTo(BigDecimal.valueOf(99)) < 0) price = BigDecimal.valueOf(99 + random.nextInt(400));

                int stock = 10 + random.nextInt(200);
                BigDecimal rating = BigDecimal.valueOf(3.0 + random.nextDouble() * 2.0).setScale(1, RoundingMode.HALF_UP);

                Product product = new Product(productName, description, price, stock, rating, imageUrl, category);
                productRepository.save(product);
                totalProducts++;
            }
        }

        System.out.println("Created " + totalProducts + " products");
    }

    private String getVariant(int index) {
        String[] colors = {"Black", "White", "Silver", "Blue", "Red", "Green", "Rose Gold", "Space Gray", "Midnight", "Graphite"};
        String[] editions = {"Pro", "Max", "Plus", "Ultra", "Lite", "SE", "Elite", "Premium", "Basic", "Advanced"};

        if (index < 10) return colors[index % colors.length];
        if (index < 20) return editions[index % editions.length];
        return colors[index % colors.length] + " " + editions[(index / 10) % editions.length];
    }

    private List<String[]> getProductTemplates(String categoryName) {
        // {Name, Description, ImageURL, BasePrice}
        Map<String, List<String[]>> templates = new HashMap<>();

        templates.put("Laptops", Arrays.asList(
            new String[]{"ASUS VivoBook 15", "15.6-inch FHD, Intel i5, 8GB RAM, 512GB SSD", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400", "45999"},
            new String[]{"HP Pavilion 14", "14-inch FHD, AMD Ryzen 5, 16GB RAM, 512GB SSD", "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=400", "54999"},
            new String[]{"Dell Inspiron 15", "15.6-inch, Intel i7, 16GB RAM, 1TB SSD", "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400", "62999"},
            new String[]{"Lenovo IdeaPad Slim 3", "14-inch FHD, AMD Ryzen 3, 8GB RAM, 256GB SSD", "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400", "34999"},
            new String[]{"MacBook Air M2", "13.6-inch Liquid Retina, Apple M2, 8GB RAM, 256GB SSD", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", "99999"},
            new String[]{"Acer Aspire 5", "15.6-inch FHD IPS, Intel i5, 8GB RAM, 512GB SSD", "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400", "42999"},
            new String[]{"MSI GF63 Thin", "15.6-inch FHD 144Hz, Intel i5, GTX 1650, 8GB RAM", "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400", "55999"},
            new String[]{"HP Envy x360", "15.6-inch FHD Touch, AMD Ryzen 7, 16GB RAM, 512GB SSD", "https://images.unsplash.com/photo-1544731612-de7f96afe55f?w=400", "72999"},
            new String[]{"Samsung Galaxy Book3", "15.6-inch AMOLED, Intel i7, 16GB RAM, 512GB SSD", "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400", "79999"},
            new String[]{"ASUS ROG Strix G16", "16-inch FHD 165Hz, Intel i7, RTX 4060, 16GB RAM", "https://images.unsplash.com/photo-1629131726692-1accd0c53ce0?w=400", "109999"}
        ));

        templates.put("Keyboards", Arrays.asList(
            new String[]{"Logitech MX Keys", "Advanced wireless illuminated keyboard", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", "8999"},
            new String[]{"Razer BlackWidow V3", "Mechanical gaming keyboard, Green switches, RGB", "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400", "9999"},
            new String[]{"Corsair K70 RGB", "Mechanical gaming keyboard Cherry MX Red", "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400", "12999"},
            new String[]{"HyperX Alloy Origins", "Mechanical gaming keyboard, compact 60%", "https://images.unsplash.com/photo-1541140532154-b024d7b22cfc?w=400", "7499"},
            new String[]{"Keychron K2 V2", "75% wireless mechanical keyboard, hot-swappable", "https://images.unsplash.com/photo-1558050032-160f36233a07?w=400", "6999"},
            new String[]{"Royal Kludge RK84", "75% tri-mode mechanical keyboard, hot-swap", "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=400", "3999"},
            new String[]{"Logitech K380", "Multi-device Bluetooth keyboard, compact", "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400", "2999"},
            new String[]{"TVS Gold Bharat", "Mechanical keyboard, Cherry MX Blue equivalent", "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400", "4499"},
            new String[]{"Redragon K552 Kumara", "Mechanical gaming keyboard, TKL, RGB", "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=400", "2499"},
            new String[]{"SteelSeries Apex Pro", "Adjustable actuation mechanical keyboard", "https://images.unsplash.com/photo-1541140532154-b024d7b22cfc?w=400", "16999"}
        ));

        templates.put("Mouse", Arrays.asList(
            new String[]{"Logitech G502 Hero", "High-performance gaming mouse, 25600 DPI", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", "3999"},
            new String[]{"Razer DeathAdder V3", "Ergonomic gaming mouse, Focus Pro 30K sensor", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", "5999"},
            new String[]{"Logitech MX Master 3S", "Advanced wireless productivity mouse", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", "8999"},
            new String[]{"SteelSeries Rival 3", "Gaming mouse, TrueMove Core sensor, split trigger", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", "2499"},
            new String[]{"Corsair Dark Core RGB Pro", "Wireless gaming mouse, 18000 DPI", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", "6999"},
            new String[]{"HyperX Pulsefire Haste", "Ultra-light gaming mouse, hex shell design", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", "3499"},
            new String[]{"Logitech G304 Lightspeed", "Wireless gaming mouse, Hero sensor", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", "2999"},
            new String[]{"Razer Viper Mini", "Ultra-light gaming mouse, 8500 DPI", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", "2999"},
            new String[]{"Apple Magic Mouse", "Multi-Touch surface, wireless", "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400", "7499"},
            new String[]{"Zebronics Zeb-Transformer", "Gaming mouse, 7 buttons, RGB", "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400", "699"}
        ));

        templates.put("Headphones", Arrays.asList(
            new String[]{"Sony WH-1000XM5", "Industry-leading noise cancellation, 30hr battery", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "24999"},
            new String[]{"JBL Tune 760NC", "Over-ear wireless, Active NC, 50hr battery", "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400", "4999"},
            new String[]{"Bose QuietComfort 45", "Premium noise cancelling wireless headphones", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400", "22999"},
            new String[]{"Samsung Galaxy Buds2 Pro", "True wireless earbuds, ANC, Hi-Fi audio", "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400", "12999"},
            new String[]{"boAt Rockerz 450", "Wireless headphone, 15hr battery, padded ear cushions", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "1499"},
            new String[]{"Audio-Technica M50x", "Professional studio monitor headphones", "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400", "12999"},
            new String[]{"HyperX Cloud II", "Gaming headset, 7.1 virtual surround, detachable mic", "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400", "5999"},
            new String[]{"Sennheiser HD 560S", "Open-back reference headphones", "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=400", "12999"},
            new String[]{"OnePlus Buds Pro 2", "True wireless, ANC, Dynaudio co-created", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "7499"},
            new String[]{"Razer Kraken V3", "Gaming headset, THX spatial audio, RGB", "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400", "6999"}
        ));

        templates.put("Monitors", Arrays.asList(
            new String[]{"LG 27-inch 4K UHD", "27-inch, 4K UHD, IPS, HDR10, FreeSync", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "24999"},
            new String[]{"Samsung 24-inch FHD", "24-inch, FHD IPS, 75Hz, eye care", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "10999"},
            new String[]{"Dell S2722DGM", "27-inch, QHD, 165Hz, curved gaming monitor", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "21999"},
            new String[]{"BenQ GW2480", "24-inch, FHD IPS, eye care, slim bezel", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "11499"},
            new String[]{"ASUS ProArt PA278CV", "27-inch, QHD, IPS, 100% sRGB, USB-C", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "29999"},
            new String[]{"Acer Nitro XV272U", "27-inch, QHD, 170Hz, 0.5ms, IPS", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "22999"},
            new String[]{"LG UltraWide 34WP500", "34-inch, UltraWide FHD, IPS, HDR10", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "21999"},
            new String[]{"Samsung Odyssey G5", "27-inch, QHD, 144Hz, curved, VA panel", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", "19999"}
        ));

        templates.put("Cameras", Arrays.asList(
            new String[]{"Canon EOS R50", "Mirrorless camera, 24.2MP, 4K video, Dual Pixel AF", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", "58999"},
            new String[]{"Sony Alpha a6400", "Mirrorless, 24.2MP, Real-time Eye AF, 4K", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", "72999"},
            new String[]{"Nikon Z50", "Mirrorless, 20.9MP, 4K UHD, Eye-Detection AF", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", "65999"},
            new String[]{"Canon EOS 200D II", "DSLR, 24.1MP, Dual Pixel AF, 4K", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", "52999"},
            new String[]{"Fujifilm X-T30 II", "Mirrorless, 26.1MP, film simulations, 4K", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", "74999"},
            new String[]{"GoPro Hero 12", "Action camera, 5.3K60, HyperSmooth 6.0", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400", "39999"}
        ));

        templates.put("Microphones", Arrays.asList(
            new String[]{"Blue Yeti", "USB condenser mic, 4 pickup patterns, plug & play", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400", "8999"},
            new String[]{"HyperX QuadCast S", "USB condenser mic, RGB, anti-vibration mount", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400", "11999"},
            new String[]{"Rode NT-USB Mini", "Studio-quality USB microphone, compact", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400", "7999"},
            new String[]{"Maono AU-PM421", "USB condenser microphone kit, pop filter included", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400", "3999"},
            new String[]{"Audio-Technica AT2020", "Cardioid condenser studio microphone", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400", "8499"},
            new String[]{"Samson Q2U", "Dynamic USB/XLR microphone for podcasting", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400", "5999"}
        ));

        templates.put("Tripods", Arrays.asList(
            new String[]{"Digitek DTR-550LW", "Lightweight aluminium tripod, 67-inch", "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400", "1499"},
            new String[]{"Manfrotto Compact Action", "Aluminium tripod with hybrid head", "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400", "4999"},
            new String[]{"Amazon Basics 60-inch", "Lightweight portable tripod, universal mount", "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400", "1299"},
            new String[]{"Joby GorillaPod 3K", "Flexible tripod for cameras and devices", "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400", "3499"},
            new String[]{"Benro Aero 4", "Travel angel video tripod kit", "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=400", "12999"}
        ));

        templates.put("Lighting", Arrays.asList(
            new String[]{"Digitek 18-inch Ring Light", "Professional ring light with stand, 3 modes", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400", "2499"},
            new String[]{"Neewer 660 LED Panel", "Bi-color dimmable LED video light", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400", "4999"},
            new String[]{"Elgato Key Light Air", "Professional LED panel for streaming", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400", "9999"},
            new String[]{"Godox SL-60W", "Studio LED video light, Bowens Mount", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400", "8999"},
            new String[]{"VIJIM VL120 Mini LED", "Portable LED video light, magnetic", "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400", "1999"}
        ));

        templates.put("Webcams", Arrays.asList(
            new String[]{"Logitech C920 HD Pro", "Full HD 1080p webcam, auto light correction", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400", "7499"},
            new String[]{"Logitech Brio 4K", "4K Ultra HD webcam with HDR", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400", "15999"},
            new String[]{"Razer Kiyo Pro", "USB camera with adaptive light sensor", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400", "11999"},
            new String[]{"HyperX Vision S", "4K webcam, auto-focus, privacy cover", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400", "9999"},
            new String[]{"Elgato Facecam", "Full HD 1080p60 streaming webcam", "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400", "12999"}
        ));

        templates.put("Tablets", Arrays.asList(
            new String[]{"Apple iPad 10th Gen", "10.9-inch, A14 Bionic, 64GB", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "39999"},
            new String[]{"Samsung Galaxy Tab S9 FE", "10.9-inch, Exynos 1380, S Pen included", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "34999"},
            new String[]{"Xiaomi Pad 6", "11-inch, Snapdragon 870, 128GB", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "24999"},
            new String[]{"OnePlus Pad", "11.61-inch, Dimensity 9000, 128GB", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "33999"},
            new String[]{"Lenovo Tab P12", "12.7-inch, Dimensity 7050, stylus included", "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400", "27999"}
        ));

        templates.put("Speakers", Arrays.asList(
            new String[]{"JBL Flip 6", "Portable Bluetooth speaker, IP67, 12hr battery", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "9999"},
            new String[]{"Sony SRS-XB100", "Portable wireless speaker, extra bass, IP67", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "3999"},
            new String[]{"Marshall Emberton II", "Portable BT speaker, 360° sound, 30hr", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "14999"},
            new String[]{"Ultimate Ears Boom 3", "360° portable BT speaker, waterproof", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "10999"},
            new String[]{"boAt Stone 1200", "Portable wireless speaker, 14W, IPX7", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "2499"},
            new String[]{"Bose SoundLink Flex", "Portable BT speaker, PositionIQ technology", "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400", "12999"}
        ));

        templates.put("Gaming Chairs", Arrays.asList(
            new String[]{"Green Soul Monster Ultimate", "Gaming chair, 4D armrests, 180° recline", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400", "18999"},
            new String[]{"Ant Esports GameX Royale", "Gaming chair, PU leather, lumbar support", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400", "9999"},
            new String[]{"Secretlab Titan Evo", "Premium gaming chair, magnetic headrest", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400", "34999"},
            new String[]{"DXRacer Formula Series", "Racing style gaming chair, steel frame", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400", "24999"},
            new String[]{"INNOWIN Venture", "Gaming chair, ergonomic, adjustable backrest", "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400", "12999"}
        ));

        templates.put("Office Chairs", Arrays.asList(
            new String[]{"Herman Miller Aeron", "Ergonomic office chair, mesh, PostureFit", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400", "89999"},
            new String[]{"IKEA Markus", "Ergonomic office chair, mesh back, armrests", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400", "14999"},
            new String[]{"Featherlite Optima", "High-back ergonomic chair, lumbar support", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400", "18999"},
            new String[]{"Green Soul Jupiter Super", "Ergonomic office chair, memory foam seat", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400", "16999"},
            new String[]{"Autonomous ErgoChair Pro", "Ergonomic chair, adjustable everything", "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400", "29999"}
        ));

        templates.put("Bags", Arrays.asList(
            new String[]{"American Tourister Urban Groove", "15.6-inch laptop backpack, water resistant", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "1999"},
            new String[]{"Wildcraft Achiever", "45L backpack, rain cover, multiple compartments", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "1599"},
            new String[]{"Safari Delta Spacious", "Laptop bag, organizer pocket, padded straps", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "999"},
            new String[]{"HP Premium Backpack", "15.6-inch laptop backpack, rain cover", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "1499"},
            new String[]{"Skybags Brat", "Casual backpack, 46cm, multiple pockets", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "849"},
            new String[]{"Dell Pro Slim Briefcase", "15-inch laptop bag, weather resistant", "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", "2499"}
        ));

        templates.put("Books", Arrays.asList(
            new String[]{"Clean Code by Robert Martin", "A handbook of agile software craftsmanship", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "599"},
            new String[]{"Data Structures and Algorithms", "Comprehensive guide to DSA with examples", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "499"},
            new String[]{"Head First Java", "A brain-friendly guide to programming in Java", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "699"},
            new String[]{"The Pragmatic Programmer", "Your journey to mastery", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "549"},
            new String[]{"System Design Interview", "An insider's guide, volume 1", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "799"},
            new String[]{"Cracking the Coding Interview", "189 programming questions and solutions", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "649"},
            new String[]{"Introduction to Machine Learning", "Pattern recognition and neural networks", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "899"},
            new String[]{"Python Crash Course", "Hands-on project-based intro to programming", "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "599"}
        ));

        templates.put("Desk Lamps", Arrays.asList(
            new String[]{"Philips Air LED Desk Lamp", "10W, 3 brightness modes, eye comfort", "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400", "1499"},
            new String[]{"Mi LED Desk Lamp 1S", "Smart desk lamp, color temperature control", "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400", "1999"},
            new String[]{"Wipro Garnet LED Desk Lamp", "6W, flexible gooseneck, touch dimmer", "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400", "999"},
            new String[]{"BenQ ScreenBar", "Monitor light bar, auto-dimming, no glare", "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400", "8999"},
            new String[]{"Syska LED Study Lamp", "USB powered, foldable, 3 color modes", "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400", "699"}
        ));

        templates.put("Power Banks", Arrays.asList(
            new String[]{"Mi Power Bank 3i 20000mAh", "20000mAh, 18W fast charging, dual USB", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", "1499"},
            new String[]{"Samsung 10000mAh Battery Pack", "10000mAh, 25W super fast charging, USB-C", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", "1999"},
            new String[]{"Anker PowerCore 26800mAh", "26800mAh, Dual input, PowerIQ", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", "3999"},
            new String[]{"Ambrane 10000mAh", "10000mAh lithium polymer, compact design", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", "799"},
            new String[]{"Realme 20000mAh Power Bank", "20000mAh, 18W two-way quick charge", "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", "1499"}
        ));

        templates.put("Watches", Arrays.asList(
            new String[]{"Casio G-Shock GA-2100", "Carbon Core Guard, analog-digital", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "8995"},
            new String[]{"Titan Octane NF9322SL02", "Analog watch, leather strap, date display", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "3495"},
            new String[]{"Fossil Gen 6 Smartwatch", "Wear OS, Snapdragon 4100+, SpO2, HR", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "16995"},
            new String[]{"Fastrack Reflex Play", "1.3\" AMOLED smartwatch, SpO2, IP68", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "2495"},
            new String[]{"Seiko 5 Automatic", "Automatic movement, stainless steel, 100m WR", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "12995"}
        ));

        templates.put("Shoes", Arrays.asList(
            new String[]{"Nike Air Max 270", "Air cushioning, breathable mesh upper", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "8999"},
            new String[]{"Adidas Ultraboost 22", "Boost midsole, Primeknit upper, Continental rubber", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "12999"},
            new String[]{"Puma RS-X", "Running System technology, retro design", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "5999"},
            new String[]{"New Balance 574", "Classic silhouette, ENCAP midsole", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "7499"},
            new String[]{"Campus FIRST", "Lightweight training shoes, memory foam", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "1499"},
            new String[]{"ASICS Gel-Kayano 30", "Stability running shoes, GEL technology", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "11999"}
        ));

        templates.put("Water Bottles", Arrays.asList(
            new String[]{"Milton Thermosteel", "1L insulated bottle, keeps hot/cold 24hr", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", "699"},
            new String[]{"Cello Swift Steel Bottle", "1L stainless steel, leak proof", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", "449"},
            new String[]{"Hydro Flask 32oz", "Vacuum insulated, stainless steel, wide mouth", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", "2999"},
            new String[]{"Nalgene Wide Mouth", "1L BPA-free Tritan, leak proof", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", "999"},
            new String[]{"boAt Lifestyle Storm", "700ml, stainless steel, double wall", "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400", "599"}
        ));

        templates.put("Stationery", Arrays.asList(
            new String[]{"Parker Vector Standard Pen", "Ball pen, stainless steel trim, gift box", "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400", "299"},
            new String[]{"Classmate Notebook Pack", "5-pack A4 notebooks, 180 pages each", "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400", "349"},
            new String[]{"Staedtler 36 Color Pencils", "36 watercolor pencils, break-resistant", "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400", "599"},
            new String[]{"Faber-Castell Connector Pens", "25 sketch pens, washable ink", "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400", "249"},
            new String[]{"Premium Desk Organizer", "Multi-compartment, bamboo desk organizer", "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400", "899"}
        ));

        // Default for categories not explicitly defined
        List<String[]> defaultTemplates = Arrays.asList(
            new String[]{"Premium " + categoryName + " Item", "High-quality " + categoryName.toLowerCase() + " product", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "2999"},
            new String[]{"Standard " + categoryName + " Item", "Reliable " + categoryName.toLowerCase() + " product for everyday use", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "1499"},
            new String[]{"Budget " + categoryName + " Item", "Affordable " + categoryName.toLowerCase() + " product, great value", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "699"},
            new String[]{"Pro " + categoryName + " Item", "Professional-grade " + categoryName.toLowerCase() + " product", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "4999"},
            new String[]{"Essential " + categoryName + " Item", "Must-have " + categoryName.toLowerCase() + " accessory", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", "999"}
        );

        return templates.getOrDefault(categoryName, defaultTemplates);
    }
}

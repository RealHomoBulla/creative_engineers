// =============================================================================
//  LootJS MODIFIERS — переработанный файл
//  Изменения:
//   - Вынесены хелперы addTierLoot / addUtilityLoot / addFoodLoot для повторяющегося лута
//   - Исправлены regex: устранено дублирование dungeon/stronghold/mineshaft между блоками
//   - Предметы внутри блоков сгруппированы: боеприпасы → еда → утилити → редкости
//   - Балансные правки: см. комментарии внутри
// =============================================================================

LootJS.modifiers((event) => {

    // =========================================================================
    //  ХЕЛПЕРЫ — общий повторяющийся лут
    //  Вызываем на уже созданном modifier и возвращаем его обратно для чейнинга
    // =========================================================================

    // Базовая валюта + вейпоинты — есть почти везде
    const addCurrencyAndWaystone = (mod, spurAmt, spurChance, dustAmt, dustChance) => {
        return mod
            .addLoot(LootEntry.of("numismatics:spur", spurAmt).when((c) => c.randomChance(spurChance)))
            .addLoot(LootEntry.of("waystones:warp_dust", dustAmt).when((c) => c.randomChance(dustChance)))
    }

    // Ранний утилити-лут (данжи, шахты, лагеря)
    const addEarlyUtility = (mod) => {
        return mod
            .addLoot(LootEntry.of("travelertoolbelt:belt").when((c) => c.randomChance(0.08)))
            .addLoot(LootEntry.of("travelertoolbelt:copper_belt").when((c) => c.randomChance(0.05)))
            .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.10)))
            .addLoot(LootEntry.of("sophisticatedbackpacks:upgrade_base").setCount([1, 2]).when((c) => c.randomChance(0.12)))
            .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.06)))
            .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_starter_tier").when((c) => c.randomChance(0.08)))
            .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.06)))
            .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.04)))
    }

    // Средний утилити-лут (башни, крепости, особняки)
    const addMidUtility = (mod) => {
        return mod
            .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.06)))
            .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.03)))
            .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
            .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_1").when((c) => c.randomChance(0.05)))
            .addLoot(LootEntry.of("functionalstorage:copper_upgrade").when((c) => c.randomChance(0.06)))
            .addLoot(LootEntry.of("functionalstorage:gold_upgrade").when((c) => c.randomChance(0.03)))
            .addLoot(LootEntry.of("ironchests:copper_chest").when((c) => c.randomChance(0.04)))
            .addLoot(LootEntry.of("ironchests:iron_chest").when((c) => c.randomChance(0.02)))
            .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
            .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.08)))
            //enchantments — medium tier
            .addLoot(enchantedBook(0.08, "medium"))
    }

    // XP-лут — опыт разного тира
    const addXpLoot = (mod, tier) => {
        // tier: "early" | "mid" | "late"
        if (tier === "early") {
            return mod
                .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        }
        if (tier === "mid") {
            return mod
                .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 8]).when((c) => c.randomChance(0.20)))
                .addLoot(LootEntry.of("create:experience_block").when((c) => c.randomChance(0.05)))
                .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.03)))
        }
        if (tier === "late") {
            return mod
                .addLoot(LootEntry.of("create:experience_block").setCount([1, 2]).when((c) => c.randomChance(0.10)))
                .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.06)))
        }
        return mod
    }

    // Create/IE базовые материалы — ранний крафт
    const addEarlyCraftMats = (mod) => {
        return mod
            .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.18)))
            .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
            .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 10]).when((c) => c.randomChance(0.18)))
            .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 3]).when((c) => c.randomChance(0.15)))
            .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 5]).when((c) => c.randomChance(0.12)))
    }

    // Apotheosis тома — общий для магических/поздних локаций
    const addApothLoot = (mod, tier) => {
        // tier: "early" | "mid" | "late"
        if (tier === "early") {
            return mod
                .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.02)))
        }
        if (tier === "mid") {
            return mod
                .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.04)))
                .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.015)))
        }
        if (tier === "late") {
            return mod
                .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.05)))
                .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.025)))
                .addLoot(LootEntry.of("apotheotic_additions:apotheotic_coin").when((c) => c.randomChance(0.012)))
        }
        return mod
    }


    // Зачарованная книга с рандомным зачарованием
    // Используем minecraft:book + enchantWithLevels — ванильный способ создания
    // зачарованных книг в лут-таблицах. Функция сама конвертирует book → enchanted_book
    // и записывает зачарования в StoredEnchantments.
    // Уровень зачарования зависит от сложности структуры:
    //   easy   (5%, lvl 1-10)   — деревни, руины, лагеря, шахты, IDAS, terralith, yung's, pillager
    //   medium (7-8%, lvl 10-20) — башни, незер-крепость, BiC 1-2, храмы, twilight, integrated
    //   hard   (10-12%, lvl 15-25) — стронгхолды, библиотеки, сокровищницы, BiC 3, deeper darker
    //   epic   (14-15%, lvl 20-30) — end city, ancient city, cataclysm
    const ENCHANT_TIERS = {
        easy:   [1, 10],
        medium: [10, 20],
        hard:   [15, 25],
        epic:   [20, 30]
    }
    const enchantedBook = (chance, tier) => {
        const [min, max] = ENCHANT_TIERS[tier] || ENCHANT_TIERS.medium
        return LootEntry.of("minecraft:book").enchantWithLevels([min, max], true).when((c) => c.randomChance(chance))
    }


    // =========================================================================
    //  ГЛОБАЛЬНЫЕ ПРАВКИ — применяются ко ВСЕМ сундукам
    // =========================================================================

    // Убираем ванильные луки и стрелы, блинчики из supplementaries
    event.addLootTypeModifier(LootType.CHEST)
        .removeLoot("minecraft:bow")
        .removeLoot("supplementaries:pancake")

    // Уменьшаем лут endrem на 90% (оставляем минимум 1)
    event.addLootTypeModifier(LootType.CHEST)
        .modifyLoot(Ingredient.all, (item) => {
            if (item.id.startsWith("endrem:")) {
                item.setCount(Math.max(1, Math.floor(item.getCount() * 0.1)))
            }
            return item
        })

    // Нормализация соли и верёвок — заменяем дубликаты из разных модов единым предметом
    event.addLootTypeModifier(LootType.CHEST)
        .replaceLoot("galosphere:salt",           "salt:salt")
        .replaceLoot("ratatouille:salt",          "salt:salt")
        .replaceLoot("vintagedelight:salt",       "salt:salt")
        .replaceLoot("create_the_salt:salt",      "salt:salt")
        .replaceLoot("additionaladditions:rope",  "supplementaries:rope")
        .replaceLoot("quark:rope",                "supplementaries:rope")
        .replaceLoot("farmersdelight:rope",       "supplementaries:rope")
        .replaceLoot("galosphere:silver_ingot",   "immersiveengineering:ingot_silver")
        .replaceLoot("caverns_and_chasms:silver_ingot", "immersiveengineering:ingot_silver")

    // Кожа — в ранних структурах (нужна для крафта, добывать неудобно)
    // Паттерн специально НЕ включает stronghold/castle — там поздняя игра
    event.addLootTableModifier(
        /minecraft:chests\/(simple_dungeon|abandoned_mineshaft)|.*village.*(toolsmith|weaponsmith|armorer).*/
    )
        .addLoot(enchantedBook(0.08, "medium"))
        .addLoot(LootEntry.of("supplementaries:rope").when((c) => c.randomChance(0.1)))
        .addLoot(LootEntry.of("minecraft:leather").setCount([1, 4]).when((c) => c.randomChance(0.20)))

    event.addLootTableModifier(/.*village.*(toolsmith|weaponsmith|armorer).*/)
        .addLoot(LootEntry.of("minecraft:leather").setCount([1, 6]).when((c) => c.randomChance(0.25)))


    // =========================================================================
    //  ДАНЖИ / ПОДЗЕМЕЛЬЯ
    //  Только vanilla dungeon, abandoned, monastery, catacomb, crypt, grave, graveyard
    //  НЕ включает stronghold/castle/mineshaft — у них свои блоки
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*(dungeon|abandoned|monastery|catacomb|crypt|grave(?!yard)|graveyard).*|.*(dungeon|abandoned|monastery|catacomb|crypt|grave(?!yard)|graveyard).*chests.*/
    )
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 16]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 8]).when((c) => c.randomChance(0.1)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 4]).when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("quark:torch_arrow").setCount([1, 6]).when((c) => c.randomChance(0.20)))
        // Мушкетные патроны — редко, подходит тематически
        .addLoot(LootEntry.of("musketmod:cartridge").setCount([1, 2]).when((c) => c.randomChance(0.06)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:beef_stew").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("farmersdelight:chicken_soup").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:ham_and_cheese_sandwich").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("brewinandchewin:creamy_onion_soup").when((c) => c.randomChance(0.10)))
        // Пиво/эль — подземные стражи пили что попроще
        .addLoot(LootEntry.of("brewinandchewin:beer").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:steel_toe_stout").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // Водка убрана из данжей — тематически не подходит
        .addLoot(LootEntry.of("miners_delight:cave_soup").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("miners_delight:insect_stew").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("miners_delight:smoked_bat_wing").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("miners_delight:bat_soup").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("galospheric_delight:cave_barbecue_stick").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("galospheric_delight:cave_pizza").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("galospheric_delight:salted_fish").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("galospheric_delight:salted_caramel").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("galospheric_delight:salted_caramel_cake_slice").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("galospheric_delight:salted_caramel_cake").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("largemeals:potato_soup").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("largemeals:cod_deluxe").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("largemeals:cooked_mutton_rack").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("farmersrespite:black_tea").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("farmersrespite:coffee_beans").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersdelight:fried_egg").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("farmersdelight:rich_soil").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersdelight:organic_compost").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Крафт-материалы (ранний старт) ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 10]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 5]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.02)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        // --- Утилити (ранний тир) ---
        .addLoot(LootEntry.of("travelertoolbelt:belt").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("travelertoolbelt:copper_belt").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:upgrade_base").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_starter_tier").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("functionalstorage:copper_upgrade").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("functionalstorage:gold_upgrade").when((c) => c.randomChance(0.04)))
        // void_upgrade убран из данжей — слишком поздний предмет
        .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.06)))

    // =========================================================================
    //  РУИНЫ
    // =========================================================================
    event.addLootTableModifier(/.*chests.*ruin.*|.*ruin.*chests.*/)
        //enchantments — easy tier
        .addLoot(enchantedBook(0.04, "easy"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 10]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 5]).when((c) => c.randomChance(0.12)))
        // --- Еда ---
        .addLoot(LootEntry.of("vintagedelight:pickled_onion").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:vinegar_mason_jar").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 8]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 4]).when((c) => c.randomChance(0.10)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("travelertoolbelt:belt").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.04)))


    // =========================================================================
    //  ЛАГЕРЯ / СТОЯНКИ / БАНДИТЫ
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*(camp|bandit|raider|outlaw|expedition|tent).*|.*(camp|bandit|raider|outlaw|expedition|tent).*chests.*/
    )
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 12]).when((c) => c.randomChance(0.25)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.12)))
        // Патроны — бандиты могут иметь мушкеты
        .addLoot(LootEntry.of("musketmod:cartridge").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:beef_stew").setCount([1, 2]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("farmersdelight:roast_chicken").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:ham_and_cheese_sandwich").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:beer").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        // Водка у бандитов — логично
        .addLoot(LootEntry.of("brewinandchewin:vodka").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:steel_toe_stout").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("largemeals:cooked_mutton_rack").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        // --- Утилити ---
        .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("travelertoolbelt:belt").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.04)))


    // =========================================================================
    //  ХИЖИНЫ / ВЕДЬМИНЫ ДОМИКИ
    // =========================================================================
    event.addLootTableModifier(/.*chests.*(hut|shack|witch).*|.*(hut|shack|witch).*chests.*/)
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:beef_stew").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:creamy_onion_soup").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:kombucha").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersrespite:green_tea").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("farmersrespite:tea_seeds").setCount([1, 3]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("vintagedelight:honey_mason_jar").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:overnight_oats").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:tree_fertilizer").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.06)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.08)))


    // =========================================================================
    //  БАШНИ / СТОРОЖЕВЫЕ ПОСТЫ / ФОРТЫ / КАЗАРМЫ
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*(tower|watchtower|fort|barracks).*|.*(tower|watchtower|fort|barracks).*chests.*/
    )
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 12]).when((c) => c.randomChance(0.25)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        // Патроны — у стражников могут быть мушкеты
        .addLoot(LootEntry.of("musketmod:cartridge").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        // Ядра пушек — убраны из башен, оставлены только для кораблей/крепостей
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:roast_chicken").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:flaxen_cheese_wheel").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("brewinandchewin:steel_toe_stout").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 12]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fabric").setCount([1, 4]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("immersiveengineering:hammer").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("create:experience_block").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.03)))
        // --- Утилити (средний тир) ---
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_1").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("ironchests:copper_chest").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("ironchests:iron_chest").when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.08)))


    // =========================================================================
    //  ДЕРЕВНИ — кузнецы (toolsmith, weaponsmith, armorer)
    // =========================================================================
    event.addLootTableModifier(/.*village.*(toolsmith|weaponsmith|armorer).*/)
        // --- Материалы ---
        .addLoot(LootEntry.of("supplementaries:rope").when((c) => c.randomChance(0.1)))
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 10]).when((c) => c.randomChance(0.25)))
        .addLoot(LootEntry.of("create:cogwheel").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:shaft").setCount([1, 8]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:millstone").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 10]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fabric").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_nickel").setCount([1, 5]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_aluminum").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_constantan").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_steel").setCount([1, 3]).when((c) => c.randomChance(0.07)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_electrum").setCount([1, 2]).when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("immersiveengineering:hammer").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("immersiveengineering:creosote_bucket").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 5]).when((c) => c.randomChance(0.12)))
        // --- Семена / еда ---
        .addLoot(LootEntry.of("create:tree_fertilizer").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("farmersrespite:tea_seeds").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersrespite:coffee_beans").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:belt").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("travelertoolbelt:copper_belt").when((c) => c.randomChance(0.04)))


    // =========================================================================
    //  ДЕРЕВНИ — жилые дома
    // =========================================================================
    event.addLootTableModifier(
        /.*village.*(house|plains|desert|savanna|snowy|taiga).*/
    )
        // --- Еда и напитки ---
        .addLoot(LootEntry.of("supplementaries:rope").when((c) => c.randomChance(0.1)))
        .addLoot(LootEntry.of("create:honeyed_apple").setCount([1, 3]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("create:sweet_roll").setCount([1, 3]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("create_confectionery:bar_of_black_chocolate").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("create_confectionery:cocoa_powder").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("create_confectionery:gingerbread").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("farmersrespite:tea_seeds").setCount([1, 4]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("farmersrespite:green_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersrespite:black_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersdelight:rich_soil").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersdelight:organic_compost").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("farmersdelight:milk_bottle").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("farmersdelight:fried_egg").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("culturaldelights:avocado").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("culturaldelights:cucumber").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("culturaldelights:pickle").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("culturaldelights:smoked_tomato").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("culturaldelights:corn_cob").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("culturaldelights:hearty_salad").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("culturaldelights:beef_burrito").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("culturaldelights:chicken_taco").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("brewinandchewin:tankard").when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:beer").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:kombucha").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:flaxen_cheese_wedge").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:pizza_slice").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:kimchi").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("vintagedelight:pickled_onion").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("vintagedelight:pickled_pepper").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:overnight_oats").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:vinegar_mason_jar").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:honey_mason_jar").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:nut_milk_bottle").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("vintagedelight:cucumber_salad").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:deluxe_burger").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("largemeals:potato_soup").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("largemeals:cooked_mutton_rack").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("largemeals:chicken_curry").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("largemeals:pasta_with_mushroom_sauce").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("largemeals:rice_pudding").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Удобрения / семена ---
        .addLoot(LootEntry.of("create:tree_fertilizer").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.18)))


    // =========================================================================
    //  КРЕПОСТИ / ЗАМКИ / РЫЦАРСКИЕ СТРУКТУРЫ
    //  Отдельный блок — не дублируем с ДАНЖИ
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*(stronghold|castle|knight).*|.*(stronghold|castle|knight).*chests.*/
    )
        //enchantments — hard tier
        .addLoot(enchantedBook(0.08, "hard"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 12]).when((c) => c.randomChance(0.25)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("musketmod:cartridge").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        // Пушки в замках — логично
        .addLoot(LootEntry.of("smallships:cannon_ball").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("smallships:cannon").when((c) => c.randomChance(0.03)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:roast_chicken").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:flaxen_cheese_wheel").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("brewinandchewin:vodka").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("brewinandchewin:steel_toe_stout").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("largemeals:cooked_mutton_rack").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("largemeals:potato_soup").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("largemeals:chicken_curry").when((c) => c.randomChance(0.10)))
        // Пир в замке — редкий блок с едой
        .addLoot(LootEntry.of("largemeals:roasted_mutton_rack_block").when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("vintagedelight:deluxe_burger").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("vintagedelight:vinegar_bottle").when((c) => c.randomChance(0.10)))
        // century_egg убрано из замков — не тематично для средневекового западного сеттинга
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:treated_wood_horizontal").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 12]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fabric").setCount([1, 4]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("immersiveengineering:hammer").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("create:experience_block").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.03)))
        // --- Утилити (средний тир) ---
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("travelertoolbelt:diamond_belt").when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_1").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("ironchests:copper_chest").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("ironchests:iron_chest").when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.08)))


    // =========================================================================
    //  ОСОБНЯК / АВАНПОСТЫ ПИЛЛАЖЕРОВ
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*mansion.*|.*mansion.*chests.*|.*chests.*pillager.*outpost.*|.*pillager.*outpost.*chests.*/
    )
        //enchantments — medium tier
        .addLoot(enchantedBook(0.06, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 12]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("musketmod:cartridge").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        // --- Еда ---
        .addLoot(LootEntry.of("create_confectionery:bar_of_black_chocolate").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersrespite:coffee_beans").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("farmersrespite:coffee").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("largemeals:pasta_with_mushroom_sauce").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("largemeals:rice_pudding").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("vintagedelight:deluxe_burger").when((c) => c.randomChance(0.10)))
        // century_egg оставлено — особняки могут быть с восточным колоритом
        .addLoot(LootEntry.of("vintagedelight:century_egg").when((c) => c.randomChance(0.02)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("create_new_age:copper_wire").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_steel").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.08)))


    // =========================================================================
    //  МАГИ / ВОЛШЕБНИКИ / ARCANE / Iron's Spellbooks / GTBCS
    //  gtbcs = "Greater Than Before Craft Structures" — магические башни
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*(mage|wizard|magic|arcane).*|.*(mage|wizard|magic|arcane).*chests.*|.*irons_spellbooks.*chests.*|.*chests.*irons_spellbooks.*|.*gtbcs.*chests.*|.*chests.*gtbcs.*/
    )
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 3]).when((c) => c.randomChance(0.08)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersrespite:green_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:creamy_onion_soup").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("galospheric_delight:lumiere_pie_slice").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("galospheric_delight:amethyst_pie_slice").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("galospheric_delight:allurite_pie_slice").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("galospheric_delight:lumiere_cocktail").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("galospheric_delight:amethyst_cocktail").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("galospheric_delight:allurite_cocktail").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("galospheric_delight:azalea_petals").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_electrum").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("create:electron_tube").when((c) => c.randomChance(0.03)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.08)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("create:experience_block").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.05)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_1").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("functionalstorage:gold_upgrade").when((c) => c.randomChance(0.05)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.015)))
        // Монета apotheotic — повышен шанс (был 0.008, маловато)
        .addLoot(LootEntry.of("apotheotic_additions:apotheotic_coin").when((c) => c.randomChance(0.015)))
        //enchantments — hard tier
        .addLoot(enchantedBook(0.12, "hard"))

    // =========================================================================
    //  БИБЛИОТЕКИ
    // =========================================================================
    event.addLootTableModifier(/.*chests.*library.*|.*library.*chests.*/)
        // --- Еда (чай для чтения!) ---
        .addLoot(LootEntry.of("farmersrespite:green_tea").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("farmersrespite:black_tea").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.10)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.08)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.02)))
        //enchantments — hard tier
        .addLoot(enchantedBook(0.12, "hard"))


    // =========================================================================
    //  СОКРОВИЩНИЦЫ
    // =========================================================================
    event.addLootTableModifier(/.*chests.*treasure.*|.*treasure.*chests.*/)
        //enchantments — hard tier
        .addLoot(enchantedBook(0.10, "hard"))
        // --- Еда (роскошная) ---
        // century_egg — экзотический деликатес, подходит для сокровищницы
        .addLoot(LootEntry.of("vintagedelight:century_egg").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("largemeals:roasted_mutton_rack_block").when((c) => c.randomChance(0.02)))
        // --- Крафт-материалы (ценные) ---
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.04)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.30)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("numismatics:bevel").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("waystones:return_scroll").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_block").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.08)))
        // --- Утилити (топовый тир) ---
        .addLoot(LootEntry.of("travelertoolbelt:diamond_belt").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:gold_backpack").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("functionalstorage:diamond_upgrade").when((c) => c.randomChance(0.05)))
        // Сундуки ironchests как лут убраны — крафтовый предмет, не трофей
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("apotheotic_additions:apotheotic_coin").when((c) => c.randomChance(0.012)))


    // =========================================================================
    //  НЕЗЕР — КРЕПОСТЬ (Nether Fortress / nether_bridge)
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*(nether_bridge|nether.*fortress).*|.*(nether_bridge|nether.*fortress).*chests.*|minecraft:chests\/nether_bridge/
    )
        //enchantments — medium tier (нефортресс: был 6%, подтянут до 7%)
        .addLoot(enchantedBook(0.07, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:netherite_arrow").setCount([1, 4]).when((c) => c.randomChance(0.08)))
        // --- Еда ---
        .addLoot(LootEntry.of("nethersdelight:hoglin_loin").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("nethersdelight:hoglin_sirloin").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("nethersdelight:nether_skewer").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:blaze_cake").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:brass_ingot").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("create:electron_tube").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("create:precision_mechanism").when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("create_new_age:copper_wire").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_electrum").setCount([1, 2]).when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_steel").setCount([1, 4]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_constantan").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.03)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:bevel").setCount([1, 3]).when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.04)))
        // netherite_belt убран из нефортресс — слишком рано для эндгейм пояса
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.02)))


    // =========================================================================
    //  НЕЗЕР — Incendium / BygoneNether / InfernalExp
    // =========================================================================
    event.addLootTableModifier(
        /.*incendium.*chests.*|.*chests.*incendium.*|.*bygonenether.*chests.*|.*chests.*bygonenether.*|.*infernalexp.*chests.*|.*chests.*infernalexp.*/
    )
        //enchantments — medium tier
        .addLoot(enchantedBook(0.07, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:netherite_arrow").setCount([1, 4]).when((c) => c.randomChance(0.08)))
        // --- Еда ---
        .addLoot(LootEntry.of("nethersdelight:hoglin_loin").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("nethersdelight:hoglin_sirloin").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("nethersdelight:hoglin_ear").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("nethersdelight:grilled_strider").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("nethersdelight:nether_skewer").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:blaze_cake").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:brass_ingot").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("create:electron_tube").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("create:precision_mechanism").when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("create_new_age:copper_wire").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_electrum").setCount([1, 2]).when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_steel").setCount([1, 4]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.03)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:bevel").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.015)))


    // =========================================================================
    //  НЕЗЕР — еда во всех сундуках измерения (через LootType.CHEST)
    //  Намеренно НЕ дублирует hoglin_loin — он уже есть в структурных блоках выше
    //  Здесь только strider_slice и blaze_cake — уникальная незер-еда
    // =========================================================================
    event.addLootTypeModifier(LootType.CHEST)
        .anyDimension("minecraft:the_nether")
        .addLoot(LootEntry.of("nethersdelight:strider_slice").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:blaze_cake").when((c) => c.randomChance(0.08)))


    // =========================================================================
    //  END CITY
    // =========================================================================
    event.addLootTableModifier(
        /.*end_city.*chests.*|.*chests.*end_city.*|.*end.*city.*chests.*|.*chests.*end.*city.*/
    )
        //enchantments — epic tier
        .addLoot(enchantedBook(0.15, "epic"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 4]).when((c) => c.randomChance(0.20)))
        // --- Еда ---
        .addLoot(LootEntry.of("ends_delight:ender_noogle").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("ends_delight:end_mixed_salad").when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("ends_delight:grilled_shulker").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("ends_delight:shulker_meat").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        // --- Крафт-материалы (AE2 — главный источник) ---
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 8]).when((c) => c.randomChance(0.60)))
        .addLoot(LootEntry.of("ae2:charged_certus_quartz_crystal").setCount([1, 4]).when((c) => c.randomChance(0.40)))
        .addLoot(LootEntry.of("ae2:fluix_crystal").setCount([1, 4]).when((c) => c.randomChance(0.35)))
        .addLoot(LootEntry.of("ae2:sky_dust").setCount([1, 6]).when((c) => c.randomChance(0.40)))
        .addLoot(LootEntry.of("ae2:ender_dust").setCount([1, 6]).when((c) => c.randomChance(0.40)))
        .addLoot(LootEntry.of("create:brass_ingot").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.04)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // waystone в End City: снижен до 15% (был 30% — слишком щедро для структурного объекта)
        .addLoot(LootEntry.of("waystones:waystone").when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 6]).when((c) => c.randomChance(0.50)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 3]).when((c) => c.randomChance(0.40)))
        .addLoot(LootEntry.of("waystones:return_scroll").setCount([1, 3]).when((c) => c.randomChance(0.40)))
        .addLoot(LootEntry.of("waystones:bound_scroll").setCount([1, 2]).when((c) => c.randomChance(0.30)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_block").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.06)))
        // --- Утилити (топовый тир) ---
        .addLoot(LootEntry.of("travelertoolbelt:diamond_belt").when((c) => c.randomChance(0.04)))
        // netherite_belt перемещён в End City — логичнее, чем в нефортресс
        .addLoot(LootEntry.of("travelertoolbelt:netherite_belt").when((c) => c.randomChance(0.015)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:gold_backpack").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_2").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_3").when((c) => c.randomChance(0.02)))
        .addLoot(LootEntry.of("functionalstorage:void_upgrade").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("functionalstorage:ender_drawer").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("functionalstorage:netherite_upgrade").when((c) => c.randomChance(0.02)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("apotheotic_additions:apotheotic_coin").when((c) => c.randomChance(0.015)))


    // =========================================================================
    //  ДРЕВНИЙ ГОРОД (Quark override, Deep Dark City)
    // =========================================================================
    event.addLootTableModifier(
        /.*ancient.*chests.*|.*chests.*ancient.*|.*quark.*city.*|.*deep.*dark.*city.*/
    )
        //enchantments — epic tier
        .addLoot(enchantedBook(0.14, "epic"))
        // --- Еда ---
        .addLoot(LootEntry.of("miners_delight:cave_soup").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 4]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("ae2:charged_certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("create:electron_tube").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.04)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.15)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_block").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.06)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:diamond_belt").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:gold_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("functionalstorage:diamond_upgrade").when((c) => c.randomChance(0.04)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.025)))
        .addLoot(LootEntry.of("apotheotic_additions:apotheotic_coin").when((c) => c.randomChance(0.01)))


    // =========================================================================
    //  IDAS
    // =========================================================================
    event.addLootTableModifier(/.*idas.*chests.*|.*chests.*idas.*/)
        .addLoot(LootEntry.of("supplementaries:rope").when((c) => c.randomChance(0.1)))
        //enchantments — easy tier (IDAS: был 2%, подтянут до 5%)
        .addLoot(enchantedBook(0.05, "easy"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 12]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.08)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:copper_belt").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("travelertoolbelt:belt").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:upgrade_base").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_starter_tier").when((c) => c.randomChance(0.08)))


    // =========================================================================
    //  BORN IN CHAOS — Level 1 / 2
    //  Пути не содержат "chests/" — уникальный формат мода
    // =========================================================================
    event.addLootTableModifier(/.*chest_level_[12].*/)
        //enchantments — medium tier
        .addLoot(enchantedBook(0.08, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 12]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.12)))
        // --- Еда ---
        .addLoot(LootEntry.of("miners_delight:smoked_bat_wing").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("miners_delight:bat_soup").when((c) => c.randomChance(0.10)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.02)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 5]).when((c) => c.randomChance(0.15)))
        // --- Утилити ---
        .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("travelertoolbelt:belt").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.04)))
        // --- Born in Chaos специфика ---
        .addLoot(LootEntry.of("functionality:pheromones").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("functionality:vex_essence").when((c) => c.randomChance(0.04)))


    // =========================================================================
    //  BORN IN CHAOS — Level 3
    // =========================================================================
    event.addLootTableModifier(/.*chest_level_3.*/)
        //enchantments — hard tier
        .addLoot(enchantedBook(0.10, "hard"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.04)))
        // precision_mechanism убран из BiC lvl3 — по прогрессии слишком рано
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:return_scroll").when((c) => c.randomChance(0.08)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_block").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.05)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_1").when((c) => c.randomChance(0.06)))
        // --- Born in Chaos специфика ---
        .addLoot(LootEntry.of("functionality:pheromones").when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("functionality:vex_essence").when((c) => c.randomChance(0.05)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.02)))


    // =========================================================================
    //  REPURPOSED STRUCTURES
    // =========================================================================
    event.addLootTableModifier(
        /.*repurposed_structures.*chests.*|.*chests.*repurposed_structures.*/
    )
        //enchantments — easy tier
        .addLoot(enchantedBook(0.05, "easy"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 10]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 5]).when((c) => c.randomChance(0.12)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:fried_egg").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("farmersdelight:rich_soil").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 8]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 4]).when((c) => c.randomChance(0.10)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("sophisticatedbackpacks:upgrade_base").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("functionalstorage:copper_upgrade").when((c) => c.randomChance(0.06)))


    // =========================================================================
    //  CATACLYSM
    // =========================================================================
    event.addLootTableModifier(/.*cataclysm.*chests.*|.*chests.*cataclysm.*/)
        //enchantments — epic tier
        .addLoot(enchantedBook(0.15, "epic"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("archeryexp:netherite_arrow").setCount([1, 2]).when((c) => c.randomChance(0.06)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:precision_mechanism").when((c) => c.randomChance(0.015)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.05)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 4]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("waystones:return_scroll").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_block").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.06)))
        // --- Утилити (топовый тир) ---
        .addLoot(LootEntry.of("travelertoolbelt:diamond_belt").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:gold_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:stack_upgrade_tier_2").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("functionalstorage:diamond_upgrade").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("functionalstorage:void_upgrade").when((c) => c.randomChance(0.02)))
        // Сундуки ironchests убраны как лут
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:improved_scrap_tome").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("apotheotic_additions:apotheotic_coin").when((c) => c.randomChance(0.015)))


    // =========================================================================
    //  DEEPER DARKER
    // =========================================================================
    event.addLootTableModifier(/.*deeperdarker.*chests.*|.*chests.*deeperdarker.*/)
        //enchantments — hard tier (deeper darker: был 11%, подтянут до 12%)
        .addLoot(enchantedBook(0.12, "hard"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        // --- Еда ---
        .addLoot(LootEntry.of("miners_delight:cave_soup").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("galospheric_delight:cave_barbecue_stick").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("galospheric_delight:salted_fish").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("create:precision_mechanism").when((c) => c.randomChance(0.008)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 3]).when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.08)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_block").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("xpbook:xp_tome").when((c) => c.randomChance(0.05)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.05)))
        // diamond_chest убран — крафтовый предмет не должен выпадать как лут
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("functionalstorage:diamond_upgrade").when((c) => c.randomChance(0.03)))
        // --- Apotheosis ---
        .addLoot(LootEntry.of("apotheosis:scrap_tome").when((c) => c.randomChance(0.025)))
        .addLoot(LootEntry.of("apotheotic_additions:apotheotic_coin").when((c) => c.randomChance(0.008)))


    // =========================================================================
    //  TWILIGHT FOREST
    // =========================================================================
    event.addLootTableModifier(/.*twilightforest.*chests.*|.*chests.*twilightforest.*/)
        //enchantments — medium tier
        .addLoot(enchantedBook(0.08, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 10]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 3]).when((c) => c.randomChance(0.08)))
        // --- Еда Twilight специфика ---
        .addLoot(LootEntry.of("twilightdelight:cooked_meef_slice").setCount([1, 4]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("twilightdelight:torchberry_cookie").setCount([1, 4]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("twilightdelight:cooked_venison_rib").setCount([1, 3]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("twilightdelight:meef_wrap").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("twilightdelight:ghast_burger").when((c) => c.randomChance(0.08)))
        // Galospheric — волшебный лес
        .addLoot(LootEntry.of("galospheric_delight:lumiere_pie_slice").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("galospheric_delight:amethyst_pie_slice").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("galospheric_delight:lumiere_cocktail").when((c) => c.randomChance(0.08)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.08)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.05)))


    // =========================================================================
    //  AQUAMIRAE + ОКЕАН / КОРАБЛИ / КОРАБЛЕКРУШЕНИЯ
    // =========================================================================
    event.addLootTableModifier(
        /.*aquamirae.*chests.*|.*chests.*aquamirae.*|.*ocean.*ruin.*chests.*|.*chests.*ocean.*ruin.*|.*shipwreck.*chests.*|.*chests.*shipwreck.*|.*chests.*(ship|wreck).*|.*(ship|wreck).*chests.*/
    )
        .addLoot(LootEntry.of("supplementaries:rope").when((c) => c.randomChance(0.1)))
        //enchantments — easy tier (океан/корабли: был 4%, подтянут до 5%)
        .addLoot(enchantedBook(0.05, "easy"))
        // --- Оружие / боеприпасы морские ---
        .addLoot(LootEntry.of("smallships:cannon_ball").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("smallships:cannon").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("functionality:harpoon").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("functionality:bident").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("functionality:fins").when((c) => c.randomChance(0.06)))
        // --- Рыбалка ---
        .addLoot(LootEntry.of("aquaculture:tackle_box").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("aquaculture:iron_fishing_rod").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("aquaculture:iron_hook").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("aquaculture:gold_hook").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("aquaculture:diamond_hook").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("aquaculture:neptunium_ingot").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("aquaculture:fishing_line").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("aquaculture:bobber").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("aquaculture:worm").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        // --- Еда (морская тематика) ---
        .addLoot(LootEntry.of("aquaculturedelight:unusual_fish_soup").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("aquaculturedelight:bass_stew").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("aquaculturedelight:fish_and_chips").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("aquaculturedelight:tuna_spaghetti").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("aquaculturedelight:trout_steak").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("aquaculturedelight:raw_fish_fillet_roll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("oceansdelight:guardian_soup").when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("oceansdelight:seagrass_salad").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("oceansdelight:squid_rings").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("oceansdelight:honey_fried_kelp").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // Алкоголь на корабле — обязательно!
        .addLoot(LootEntry.of("brewinandchewin:red_rum").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("brewinandchewin:vodka").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:beer").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:tankard").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("vintagedelight:salted_cod").setCount([1, 3]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("vintagedelight:salted_salmon").setCount([1, 3]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("vintagedelight:vinegar_bottle").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("farmersrespite:black_tea").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("rubberworks:resin_bucket").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.08)))


    // =========================================================================
    //  MOWZIE'S MOBS / ILLAGER INVASION
    // =========================================================================
    event.addLootTableModifier(
        /.*mowziesmobs.*chests.*|.*chests.*mowziesmobs.*|.*illagerinvasion.*chests.*|.*chests.*illagerinvasion.*/
    )
        //enchantments — medium tier
        .addLoot(enchantedBook(0.06, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 3]).when((c) => c.randomChance(0.08)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("waystones:warp_scroll").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        // --- Утилити ---
        .addLoot(LootEntry.of("sophisticatedbackpacks:iron_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("functionality:pheromones").when((c) => c.randomChance(0.05)))


    // =========================================================================
    //  INTEGRATED STRUCTURES (integrated_dungeons_and_structures и аналоги)
    //  Осторожный паттерн — только точный namespace "integrated_"
    // =========================================================================
    event.addLootTableModifier(
        /.*\bintegrated_dungeons\b.*chests.*|.*chests.*\bintegrated_dungeons\b.*|.*\bintegrated_structures\b.*chests.*|.*chests.*\bintegrated_structures\b.*/
    )
        //enchantments — medium tier
        .addLoot(enchantedBook(0.08, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 8]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 4]).when((c) => c.randomChance(0.12)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:rich_soil").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 8]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 4]).when((c) => c.randomChance(0.10)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("sophisticatedbackpacks:upgrade_base").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("functionalstorage:copper_upgrade").when((c) => c.randomChance(0.06)))


    // =========================================================================
    //  ШАХТЫ (Mineshaft)
    //  Отдельный блок — НЕ дублируется с ДАНЖИ
    // =========================================================================
    event.addLootTableModifier(/.*mineshaft.*chests.*|.*chests.*mineshaft.*/)
        .addLoot(LootEntry.of("supplementaries:rope").when((c) => c.randomChance(0.1)))
        // --- Еда шахтёрская ---
        .addLoot(LootEntry.of("miners_delight:cave_soup").setCount([1, 2]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("miners_delight:insect_stew").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("miners_delight:smoked_bat_wing").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("galospheric_delight:cave_barbecue_stick").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("galospheric_delight:salted_fish").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("create:cogwheel").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_nickel").setCount([1, 4]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 3]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 10]).when((c) => c.randomChance(0.18)))
        .addLoot(LootEntry.of("immersiveengineering:creosote_bucket").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("immersiveengineering:redstone_mechanism").when((c) => c.randomChance(0.015)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("rubberworks:rubber").setCount([1, 5]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("rubberworks:rubber_sheet").setCount([1, 2]).when((c) => c.randomChance(0.07)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.08)))
        // --- XP ---
        .addLoot(LootEntry.of("create:experience_nugget").setCount([1, 5]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("create:experience_block").when((c) => c.randomChance(0.03)))
        // --- Утилити ---
        .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("travelertoolbelt:copper_belt").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.03)))
        //enchantments — easy tier (шахты: был 3%, подтянут до 5%)
        .addLoot(enchantedBook(0.05, "easy"))

    // =========================================================================
    //  ХРАМЫ / ПИРАМИДЫ
    // =========================================================================
    event.addLootTableModifier(
        /.*chests.*(temple|pyramid).*|.*(temple|pyramid).*chests.*/
    )
        //enchantments — medium tier
        .addLoot(enchantedBook(0.08, "medium"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 8]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 3]).when((c) => c.randomChance(0.08)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:beef_stew").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // century_egg — восточный деликатес, в пирамидах/храмах уместен
        .addLoot(LootEntry.of("vintagedelight:century_egg").when((c) => c.randomChance(0.03)))
        .addLoot(LootEntry.of("create_confectionery:bar_of_black_chocolate").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_electrum").setCount([1, 2]).when((c) => c.randomChance(0.06)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.01)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:gold_belt").when((c) => c.randomChance(0.04)))


    // =========================================================================
    //  TERRALITH
    // =========================================================================
    event.addLootTableModifier(/.*terralith.*chests.*|.*chests.*terralith.*/)
        //enchantments — easy tier
        .addLoot(enchantedBook(0.05, "easy"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 10]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 5]).when((c) => c.randomChance(0.12)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersrespite:tea_seeds").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 8]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.06)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("travelertoolbelt:copper_belt").when((c) => c.randomChance(0.05)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.04)))


    // =========================================================================
    //  YUNG'S СТРУКТУРЫ
    //  (Bridges, Extras, Better Dungeons, Mineshafts, Fortresses, Temples, etc.)
    // =========================================================================
    event.addLootTableModifier(
        /.*yungsbridges.*chests.*|.*chests.*yungsbridges.*|.*yungsextras.*chests.*|.*chests.*yungsextras.*|.*betterdungeons.*chests.*|.*chests.*betterdungeons.*|.*bettermineshafts.*chests.*|.*chests.*bettermineshafts.*|.*betterfortresses.*chests.*|.*chests.*betterfortresses.*|.*betterjungletemples.*chests.*|.*chests.*betterjungletemples.*|.*betterdeserttemples.*chests.*|.*chests.*betterdeserttemples.*|.*betteroceanmonuments.*chests.*|.*chests.*betteroceanmonuments.*/
    )
        //enchantments — easy tier
        .addLoot(enchantedBook(0.05, "easy"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 10]).when((c) => c.randomChance(0.20)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 5]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("archeryexp:diamond_arrow").setCount([1, 3]).when((c) => c.randomChance(0.06)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:beef_stew").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:beer").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("create:builders_tea").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_lead").setCount([1, 3]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 8]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("ae2:certus_quartz_crystal").setCount([1, 2]).when((c) => c.randomChance(0.05)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.005)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("waystones:warp_scroll").when((c) => c.randomChance(0.06)))
        // --- Утилити ---
        .addLoot(LootEntry.of("comforts:sleeping_bag_black").when((c) => c.randomChance(0.08)))
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.04)))


    // =========================================================================
    //  PILLAGER-СТРУКТУРЫ
    //  (Takes a Pillage, Create Pillagers, Savage and Ravage)
    // =========================================================================
    event.addLootTableModifier(
        /.*takesapillage.*chests.*|.*chests.*takesapillage.*|.*create_pillagers.*chests.*|.*chests.*create_pillagers.*|.*savage_and_ravage.*chests.*|.*chests.*savage_and_ravage.*/
    )
        //enchantments — easy tier
        .addLoot(enchantedBook(0.05, "easy"))
        // --- Боеприпасы ---
        .addLoot(LootEntry.of("archeryexp:iron_arrow").setCount([1, 12]).when((c) => c.randomChance(0.2)))
        .addLoot(LootEntry.of("archeryexp:gold_arrow").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("musketmod:cartridge").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Еда ---
        .addLoot(LootEntry.of("farmersdelight:roast_chicken").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("brewinandchewin:ham_and_cheese_sandwich").when((c) => c.randomChance(0.12)))
        .addLoot(LootEntry.of("brewinandchewin:beer").setCount([1, 2]).when((c) => c.randomChance(0.12)))
        // --- Крафт-материалы ---
        .addLoot(LootEntry.of("create:andesite_alloy").setCount([1, 6]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("immersiveengineering:ingot_steel").setCount([1, 3]).when((c) => c.randomChance(0.10)))
        .addLoot(LootEntry.of("immersiveengineering:hemp_fiber").setCount([1, 8]).when((c) => c.randomChance(0.12)))
        // --- Валюта ---
        .addLoot(LootEntry.of("numismatics:spur").setCount([1, 2]).when((c) => c.randomChance(0.15)))
        .addLoot(LootEntry.of("numismatics:sprocket").setCount([1, 2]).when((c) => c.randomChance(0.005)))
        .addLoot(LootEntry.of("waystones:warp_dust").setCount([1, 2]).when((c) => c.randomChance(0.10)))
        // --- Утилити ---
        .addLoot(LootEntry.of("travelertoolbelt:iron_belt").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("sophisticatedbackpacks:copper_backpack").when((c) => c.randomChance(0.04)))
        .addLoot(LootEntry.of("functionality:pheromones").when((c) => c.randomChance(0.05)))

})

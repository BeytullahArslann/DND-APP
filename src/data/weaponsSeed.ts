export const weaponsSeedData = [
	{
		"name": "Canlı Kalkan",
		"type": "S",
		"weight": "6",
		"ac": 2,
		"tier": "Üst",
		"rarity": "Çok Nadir",
		"source": "DMG",
		"page": 183,
		"reqAttune": "YES",
		"entries": [
			"Bu kalkanı tutarken, bonus eylem olarak onun komut sözünü söyleyip canlandırabilirsin. Kalkan havaya yükselir ve senin alanında kalıp sanki sen onu tutuyormuşsun gibi seni korumaya devam eder, ellerin boş kalabilir. Kalkan 1 dakikalığına, bonus eylem kullanıp bitirene, veya sen {@condition etkisiz hal}e gelene ya da ölene dek canlı kalır, büyü sonlandığında kalkan yere düşer ya da boş elin varsa eline döner."
		]
	},
	{
		"name": "Cüce Lordların Baltası",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "4",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"T",
			"V"
		],
		"range": "20/60",
		"rarity": "Artefakt",
		"source": "DMG",
		"page": 221,
		"reqAttune": "YES",
		"entries": [
			"Halkının çektiği çileleri görünce genç bir cüce prens, halkını birleştirecek bir şeye ihtiyaç olduğunu farketmiş. Bu yüzden, bu tip bir sembol olabilecek bir silahı dövmek için yola koyulmuş.",
			"Daha önce hiçbir cücenin inmediği kadar dağların derinliklerine inip bu genç prens yüce bir yanardağın kalbine gelmiş. Yaratılışın cüce tanrısı Moradin'in yardımı ile, önce 4 ulu aleti yaratmış: {@italic Acımasız Kazma}, {@italic Toprakyürek Ocağı}, {@italic Şarkıların Örsü} ve {@italic Şekil Veren Çekiç}. Onları kullanıp {@italic Cüce Lordların Baltası}'nı yarattı.",
			"Artefaktı kuşanmış bir şekilde, prens cüce klanlarına döndü ve barış getirdi. Baltası garezleri bitirip haraketlere karşılığını verdi. Klanlar müttefik oldu ve düşmanlarını geri püskürtüp bir refah çağı yaşadılar. Bu genç cüce İlk Kral olarak hatırlanır. Yaşlandığında, otoritenin simgesi olan bu silahı varisine bıraktı. Meşru varisler bu baltayı nesiller boyunca aktardı.",
			"Sonraları fenalık ve hıyanet dolu karanlık bir dönemde, baltanın gücü ve getirdiği statüye duyulan açgözlülük ve kıskançlık yüzünden çıkan kanlı bir iç savaşta bu balta kayboldu. Asırlar sonrasında cüceler hala bu baltayı ararlar ve birçok maceracı eski hazineler ve harabeleri yağmalayıp bu baltayı bulmayı hayatlarının amacı olarak benimsemiştir.",
			"Büyülü Silah.{@italic Cüce Lordların Baltası} onunla yapılan saldırı ve hasar zarlarına +3 bonus veren büyülü bir silahtır. Balta aynı zamanda bir {@item cüce halkın kemeri}, bir {@item cüce işi fırlatıcı} ve de bir {@item keskinlik kılıcı} işlevi de görür.",
			{
				"type": "entries",
				"name": "Rastgele Özellikler",
				"entries": [
					"Balta şu rastgele belirlenen özelliklere de sahiptir:",
					{
						"type": "list",
						"items": [
							"2 küçük yararlı özellik",
							"1 büyük yararlı özellik",
							"2 küçük zararlı özellik"
						]
					}
				]
			},
			{
				"type": "entries",
				"name": "Moradin'in Lütfu",
				"entries": [
					"Eğer baltaya bağlı bir cüce isen, şu özellikleri alırsın:",
					{
						"type": "list",
						"items": [
							"Zehir hasarına bağışıklığın olur.",
							"Gece görüşünün mesafesi 60 fit artar.",
							"Demircilik, mayacılık ve taş işçiliğine bağlı zanaatkar aletleri ile uzmanlığın olur."
						]
					}
				]
			},
			{
				"type": "entries",
				"name": "Toprak Elementali Yarat",
				"entries": [
					"Eğer baltayı tutuyorsan, eylemini kullanıp ondan {@spell conjure elemental (elemental yarat)} büyüsünü kullanarak bir {@creature toprak elementali} yaratabilirsin. Bu özelliği sonraki şafaka dek bir daha kullanamazsın."
				]
			},
			{
				"type": "entries",
				"name": "Derinlerde Gez",
				"entries": [
					"Eylemini kullanıp baltayı sabit bir cüce taş işçiliğine değdirip ondan {@spell teleport (Işınlan)} büyüsünü kullanabilirsin. Eğer hedeflediğin varış noktan yer altındaysa, bir terslik ya da beklenmedik bir yere varma şansın olmaz. Bu özelliği 3 gün geçene dek bir daha kullanamazsın."
				]
			},
			{
				"type": "entries",
				"name": "Lanet",
				"entries": [
					"Balta, ona bağlanan cüce dışı varlıkları etkileyen bir lanete sahiptir. Bağlanma bitse bile, lanet kalır. Her geçen gün, varlığın fiziksel görünüşü ve yapısı cüceleşir. 7 gün sonunda, varlık tipik bir cüce gibi görünür ama varlık ne kendi ırksal özelliklerini yitirir ne de bir cücenin ırksal özelliklerini kazanır. Baltanın getirdiği bu fiziksel değişimlerin yapısı büyülü değildir (bu yüzden defedilemez), ama {@spell greater restoration (Üstün yenileme)} ve {@spell remove curse (lanet kaldır)} büyüleri gibi lanet kaldırabilen etkilerle kaldırılabilir."
				]
			},
			{
				"type": "entries",
				"name": "Baltayı Yok Etme",
				"entries": [
					"Baltayı yok etmenin tek yolu onu yaratıldığı yerde, {@italic Toprakyürek Ocağında} eritmektir. Yanan ocakta 50 yıl bekledikten sonra ateşe yenik düşer ve yok olur."
				]
			}
		]
	},
	{
		"name": "Ok Çeken Kalkan",
		"type": "S",
		"weight": "6",
		"ac": 2,
		"tier": "Üst",
		"rarity": "Nadir",
		"source": "DMG",
		"page": 152,
		"reqAttune": "YES",
		"entries": [
			"Bu kalkanı kullanırken menzilli saldırılara karşı +2 AC bonusun olur. Bu, kalkanın normal AC bonusunun üzerine eklenir. Ayrıca, biri 5 fit yakınındaki bir hedefe menzilli saldırı yaparsa, reaksiyonunu kullanıp bu saldırının hedefi olabilirsin."
		]
	},
	{
		"name": "Karaustura",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "6",
		"dmg1": "2d6",
		"dmgType": "S",
		"property": [
			"H",
			"2H"
		],
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 216,
		"reqAttune": "Sınırlama: Düzenli yönelimi olmayan bir varlık",
		"sentient": true,
		"entries": [
			"White Plume Dağlarının zindanlarında gizli olan Karaustura, yıldızlarla dolu bir gece gökyüzü gibi parlar. Kara kabzası kesilmiş obsidyenlerle bezenmiştir.",
			"Bu büyülü silah ile yapılan saldırı ve hasar zarlarında +3 bonusun olur. Aşağıdaki ek özelliklere de sahiptir.",
			"Ruh Tüket. Ne zaman bununla bir varlığı 0 HP'ye düşürsen, kılıç varlığı öldürüp ruhunu tüketir, yapılar ve yaşayan ölüler bundan etkilenmez. Ruhu Karaustura tarafından tüketilen bir varlık sadece {@spell wish (dilek)} büyüsü ile hayata döndürülebilir.",
			"Bir ruhu tükettiğinde, Karaustura öldürülen varlığın maksimum HP'si kadar sana geçici HP verir. Bu HP 24 saat sonrasında kaybolur. Bu geçici HP üzerinde ve Karaustura elinde olduğu sürece, saldırı, kurtulma ve yetenek zarlarında avantajın olur.",
			"Bu silahla bir yaşayan ölü varlığa vurursan, 1d10 nekrotik hasar alırsın ve hedefin 1d10 HP yeniler. Eğer bu hasar seni 0 HP'ye düşürürse, Karaustura ruhunu tüketir.",
			"Ruh Avcısı. Silahı tutarken 60 fit çevrende yapı ya da yaşayan ölü olmayan Ufak ve üzeri boydaki varlıklardan haberdar olursun. Ayrıca {@condition cezbedilme} ve {@condition korkma} bağışıklığın olur.",
			"Karaustura {@spell haste (acele)} büyüsünü senin üzerinde günde bir kere kullanabilir. O ne zaman kullanacağına karar verir ve sen yapmak zorunda kalma diye konsantre olur.",
			"Bilinç. Karaustura düzensiz nötr yönelimli, 17 Zeka, 10 Akıl ve 19 Karizma skorlarına sahip bilinçli bir silahtır. 120 fite kadar işitebilir ve gece görüşü vardır.",
			"Silah Ortak dili okur, anlar ve konuşabilir, ayrıca kullanıcısı ile telepatik iletişime geçebilir. Sesi derin ve yankılıdır. Ona bağlıyken, Karaustura senin bildiğin her dili de anlar.",
			"Kişilik. Karaustura sanki itaat edilmesine alışmış gibi buyurucu bir tonla konuşur.",
			"Kılıcın amacı ruh tüketmektir. Kimin ruhunu yediğini umursamaz, kullanıcısı dahil. Kılıç tüm madde ve enerjinin bir negatif enerji boşluğundan çıktığına ve bir gün yine ona döneceğine inanır. Karaustura sadece bu süreci hızlandırır.",
			"Nihilizmine rağmen Karaustura White Plume Dağlarının zindanlarında birlikte hapsolduğu {@item Dalga} ve {@item Whelm} silahlarıyla garip bir bağ hisseder. Üç silahın da birleşip savaşta birlikte kullanılmasını, {@item Whelm}'e şiddetle karşı çıksa ve {@item Dalga}'yı sıkıcı bulsa da ister.",
			"Karaustura'nın ruhlara duyduğu iştahı düzenli bir şekilde beslenmelidir. Eğer kılıç ruh tüketmeden 3 gün veya fazlasını geçirirse, sonraki gün batımında kullanıcısı ile bir çatışma çıkar."
		]
	},
	{
		"name": "Zehir Hançeri",
		"type": "M",
		"weaponCategory": "Basit",
		"weight": "1",
		"dmg1": "1d4",
		"dmgType": "P",
		"property": [
			"F",
			"L",
			"T"
		],
		"range": "20/60",
		"tier": "Üst",
		"rarity": "Nadir",
		"source": "DMG",
		"page": 161,
		"entries": [
			"Bu büyülü silah ile yapılan saldırı ve hasar zarlarına +1 bonus eklersin.",
			"Eylemini kullanıp yoğun, kara bir zehrin hançeri kaplamasını sağlayabilirsin. Zehir 1 dakikalığına ya da bu silah ile yapılmış bir saldırı bir varlığa vurana kadar kalır. Varlık DC 15 Dayanıklılık kurtulma zarı atar ya da 2d10 zehir hasarı alır ve 1 dakikalığına {@condition zehirlenme} etkisinde olur. Hançer sonraki şafağa kadar bir daha bu şekilde kullanılamaz."
		]
	},
	{
		"name": "Cüce İşi Fırlatıcı",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "2",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "B",
		"property": [
			"T",
			"V"
		],
		"range": "20/60",
		"tier": "Üst",
		"rarity": "Çok Nadir",
		"source": "DMG",
		"page": 167,
		"reqAttune": "Sınırlama: Cüce",
		"entries": [
			"Bu büyülü silah ile yaptığın saldırı ve hasar zarlarına +3 bonusun olur. Normal menzili 20, uzun menzili 60 fit olacak şekilde fırlatma özelliğine sahiptir. Bu silah ile yaptığın bir menzilli saldırı ile vurursan, fazladan 1d8 hasar ya da hedef bir dev ise fazladan 2d8 hasar verir. Saldırının hemen sonrasında silah uçarak eline döner."
		]
	},
	{
		"name": "Yıldırım Ciriti",
		"type": "M",
		"weaponCategory": "Basit",
		"weight": "2",
		"dmg1": "1d6",
		"dmgType": "P",
		"property": [
			"T"
		],
		"range": "30/120",
		"tier": "Üst",
		"rarity": "Seyrek",
		"source": "DMG",
		"page": 178,
		"entries": [
			"Bu cirit büyülü bir silahtır. Onu fırlatıp komut sözünü söylediğinde, senden hedefine 120 fite kadar uzanan 5 fit genişliğinde bir yıldırıma dönüşür. Hattaki sen ve hedefin dışındaki her varlık DC 13 Çeviklik kurtulma zarı atar, başarısız olursa 4d6 yıldırım hasarı alır, başarılı olursa bunun yarısını. Bu yıldırım hedefe vardığında yeniden cirite dönüşür. Hedefe karşı menzilli silah saldırısı yap. Vurursa, hedef hem ciritin hasarını hem de 4d6 yıldırım hasarını alır.",
			"Sonraki şafağa kadar ciritin bu özelliği bir daha kullanılamaz. Bu süreçte, cirit hala büyülü bir silah olarak kullanılabilir."
		]
	},
	{
		"name": "Parçalama Gürzü",
		"type": "M",
		"weaponCategory": "Basit",
		"weight": "4",
		"dmg1": "1d6",
		"dmgType": "B",
		"tier": "Üst",
		"rarity": "Nadir",
		"source": "DMG",
		"page": 179,
		"reqAttune": "YES",
		"entries": [
			"Bu büyülü silah ile bir zebani ya da yaşayan ölüye vurduğunda, o varlık fazladan 2d6 radyant hasar alır. Eğer hedefin bu hasarı aldıktan sonra 25 veya daha az HP'si kalırsa DC 15 Akıl kurtulma zarı atar ya da yok olur. Başarılı olursa, bu varlık senin sonraki sıranın sonuna kadar senden {@condition korkma} durumunda olur.",
			"Bu silahı tutarken 20 fit çevresine parlak, ötesinde 20 fit daha loş ışık saçar."
		]
	},
	{
		"name": "Çarpma Gürzü",
		"type": "M",
		"weaponCategory": "Basit",
		"weight": "4",
		"dmg1": "1d6",
		"dmgType": "B",
		"tier": "Üst",
		"rarity": "Nadir",
		"source": "DMG",
		"page": 179,
		"entries": [
			"Bu büyülü silah ile saldırı ve hasar zarlarına +1 bonusun olur. Gürzü bir yapıya (varlık tipi, bina değil) vurmak için kullanırsan bonus +3'e çıkar.",
			"Bu silah ile yapılan bir saldırı zarında 20 atarsan hedef fazladan 7 ezme hasarı alır, eğer bir yapı ise bu hasar 14'e çıkar. Eğer bu hasarı aldıktan sonra bir yapının 25 veya daha az HP'si kalmışsa yok olur."
		]
	},
	{
		"name": "Dehşet Gürzü",
		"type": "M",
		"weaponCategory": "Basit",
		"weight": "4",
		"dmg1": "1d6",
		"dmgType": "B",
		"tier": "Üst",
		"rarity": "Nadir",
		"source": "DMG",
		"page": 180,
		"reqAttune": "YES",
		"entries": [
			"Bu büyülü silahın 3 yükü vardır. Onu tutarken eylemini kullanıp 1 yük harcayarak bir dehşet dalgası yayabilirsin. Senin 30 fit çevrende seçeceğin her varlık DC 15 Akıl kurtulma zarı atar ya da 1 dakikalığına senden {@condition korkma} durumunda olurlar. Bu şekilde korkarken bir varlık sırasını senden olabildiğince uzaklaşmak için kullanmalıdır, ve istekli bir şekilde senin 30 fit yakınına yaklaşamaz. Reaksiyon da kullanamaz. Eylemi için sadece Depar kullanır ya da onun hareketi engelleyen bir etkiden kaçmaya çalışabilir. Eğer hareket edebileceği bir yer yoksa varlık Kaçınma eylemini kullanır. Her sırasının sonunda bir varlık kurtulma zarını yenileyebilir, başarılı olursa üzerindeki etki sonlanır.",
			"Gürz her şafakta 1d3 harcanmış yük yeniler."
		]
	},
	{
		"name": "Yemin Yayı",
		"type": "R",
		"weaponCategory": "Askeri",
		"weight": "2",
		"dmg1": "1d8",
		"dmgType": "P",
		"property": [
			"A",
			"H",
			"2H"
		],
		"range": "150/600",
		"tier": "Üst",
		"rarity": "Çok Nadir",
		"source": "DMG",
		"page": 168,
		"reqAttune": "YES",
		"entries": [
			"Bu yayın kirişine bir ok yerleştirdiğinde, Elfçe \"Düşmanlarıma tez ölüm.\" diye fısıldar. Bu silahı menzilli bir saldırı yapmak için kullandığında, bir komut sözü olarak \"Bana yanlış yapanlara tez ölüm.\" diye fısıldayabilirsin. Saldırının hedefi o ölene ya da 7 gün sonrasına kadar yeminli düşmanın olur. Aynı anda sadece bu tipte bir yeminli düşmanın olabilir. Yeminli düşmanın öldükten sonra, bir sonraki şafakta yeni bir düşman seçebilirsin.",
			"Bu silahla yeminli düşmanına karşı menzilli bir saldırı yaptığında, zarda avantajın olur. Ayrıca, hedefin tam siper olmadığı sürece siperden faydalanamaz ve sen uzun mesafeden dolayı dezavantajlı olmazsın. Eğer saldırı vurursa, yeminli düşmanın fazladan 3d6 delme hasarı alır.",
			"Yeminli düşmanın hayatta olduğu sürece diğer silahlarla yapacağın tüm saldırı zarları dezavantajlı olur."
		]
	},
	{
		"name": "Yıldırımların Çekici",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "10",
		"dmg1": "2d6",
		"dmgType": "B",
		"property": [
			"H",
			"2H"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 173,
		"entries": [
			"Bu büyülü silah ile yaptığın saldırı ve hasar zarlarına +1 bonusun olur.",
			{
				"type": "entries",
				"name": "Devin Felaketi (Bağlanma gerekir)",
				"entries": [
					"Bu silaha bağlanabilmek için herhangi bir tip {@italic dev gücü kemeri} takmalısın ve {@item ogre gücü eldivenleri}ni giymelisin. Bu bağlanma eğer o iki eşyadan birini çıkarırsan sonlanır. Bu silaha bağlıyken ve onu tutuyorken, Kuvvet skorun 4 artar ve bu şekilde 20'yi geçebilse de 30'u geçemez. Bu silah ile bir deve karşı yaptığın saldırı zarında 20 atarsan, dev DC 17 Dayanıklılık kurtulma zarı atar ya da ölür."
				]
			},
			"Çekicin aynı zamanda 5 yükü vardır. Ona bağlıyken 1 yük harcayıp çekiç ile menzilli silah saldırısı yapabilirsin, onu normali 20 ve uzun menzili 60 olan fırlatma özelliğine sahip bir silah gibi varsayarsın. Eğer saldırı vurursa, çekiç 300 fitten duyulabilen bir gök gürültüsü yaratır. Hedef ve 30 fit çevresindeki tüm varlıklar DC 17 Dayanıklılık kurtulma zarı atar ya da bir sonraki sıranın sonuna kadar {@condition sersemleme} durumunda kalırlar. Çekiç her şafakta 1d4+1 yük yeniler."
		]
	},
	{
		"name": "Ay Kılıcı",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 217,
		"reqAttune": "Sınırlama: Nötr İyi yönelimli bir Elf ya da Yarı Elf",
		"sentient": true,
		"entries": [
			"Elfler tarafından yaratılan onca büyülü eşya arasında en değerlilerinden ve en çok korunanlarından biri ay kılıcıdır. Antik zamanlarda neredeyse tüm elf soylu evleri bu tip bir kılıca sahipti. Yüzyıllar geçtikçe, sonu gelen soylar ile birlikte güçleri tükenen bazı kılıçlar dünyadan silindi. Diğer kılıçlar ise sahipleri ulu görevlerde iken onlarla birlikte kayboldu. Bu yüzden, bu silahlardan sadece birkaçı kaldı.",
			"Bir ay kılıcı ebeveynden çocuğa geçer. Kılıç kullanıcısını seçer ve ömrü boyunca o kişiye bağlanır. Eğer kullanıcı ölürse başka bir varis kılıcı devralabilir. Eğer ona layık bir varis yoksa, kılıç sönük bir şekilde bekler. Ona layık biri onu bulup gücüne erişene kadar sıradan bir uzun kılıç işlevindedir.",
			"Bir ay kılıcı aynı anda sadece bir efendiye hizmet eder. Bağlanma süreci bir elf hükümdarının taht odasında ya da elf tanrılarına adanmış bir tapınakta yapılacak özel bir ritüel gerektirir.",
			"Bir ay kılıcı asla namert, dengesiz, yozlaşmış gördüğü veya elf halkını korumakta tereddüt edeceğini düşündüğü birine hizmet etmez. Eğer kılıç seni reddederse, yetenek, saldırı ve kurtulma zarlarını 24 saatliğine dezavantajlı atarsın. Eğer kılıç seni kabul ederse, ona bağlanırsın ve kılıçta yeni bir rün belirir. Sen ölene ya da silah yok olana dek ona bağlı kalırsın.",
			"Bir ay kılıcında şu ana kadar hizmet ettiği her efendi için bir rün vardır (genellikle 1d6+1). İlk rün daima bu büyülü silah ile yapılan saldırı ve hasar zarlarına +1 bonus ekler. Birincinin ötesinde her rün ay kılıcına fazladan bir özellik ekler. Her özelliği ya DM seçer ya da aşağıdaki Ay Kılıcı Özellikleri tablosundan rastgele belirler.",
			{
				"type": "table",
				"caption": "Ay Kılıcı Özellikleri",
				"colLabels": [
					"d100",
					"Özellik"
				],
				"colStyles": [
					"col-xs-1 text-align-center",
					"col-xs-11"
				],
				"rows": [
					[
						"01-40",
						"Maksimum +3 olacak şekilde saldırı ve hasar zarlarına bonusu 1 arttır. Eğer kılıç zaten +3 bonustaysa yeniden zar atarsın."
					],
					[
						"41-80",
						"Ay kılıcı rastgele belirlenecek şekilde küçük bir özellik kazanır (bunun için DMG sayfa 143'de \"Special Features\" kısmına bakın)."
					],
					[
						"81-82",
						"Ay kılıcı beceri özelliğini alır."
					],
					[
						"83-84",
						"Ay kılıcı fırlatma özelliğini alır (menzil 20/60 fit)."
					],
					[
						"85-86",
						"Ay kılıcı {@item muhafız} işlevini görür."
					],
					[
						"87-90",
						"Ay kılıcı 19 veya 20 atınca kritik vurur."
					],
					[
						"91-92",
						"Bir ay kılıcı ile vurduğun darbe fazladan 1d6 kesme hasarı verir."
					],
					[
						"93-94",
						"Ay kılıcı ile belirli bir tip varlığa vurduğunda (ejderha, zebani ya da yaşayan ölü gibi), hedef bu tiplerden birinde fazladan 1d6 hasar alır: asit, soğuk, ateş, yıldırım veya ses."
					],
					[
						"95-96",
						"Bonus eylemini kullanıp ay kılıcından ışık saçabilirsin. 30 fit yakınında seni görebilen her varlık DC 15 Dayanıklılık kurtulma zarı atar ya da 1 dakikalığına {@condition körlük} durumunda olur. Bir varlık her sırasının sonunda kurtulma zarını tekrarlayabilir, başarılı olursa üzerindeki etki sonlanır. Bu özellik sen silaha bağlıyken bir kısa dinlenme bitirene kadar yeniden kullanılamaz."
					],
					[
						"97-98",
						"Ay kılıcı bir {@item büyü depolama yüzüğü} işlevini görür."
					],
					[
						"99",
						"Eğer zaten sana hizmet eden bir tane yoksa eylemini kullanıp bir elf gölgesi çağırabilirsin. Elf gölgesi 120 fit yakınında boş bir alanda belirir. Bir {@creature gölge} istatistiklerini kullanır ama nötrdür, yaşayan ölüleri kovan etkilere bağışıktır ve yeni gölgeler yaratamaz. Bu varlığı kontrol eder, nasıl hareket edip davranacağını belirlersin. 0 HP'ye düşene ya da sen eylemini kullanıp savana kadar kalır."
					],
					[
						"00",
						"Ay kılıcı {@item vorpal kılıç} işlevini görür."
					]
				]
			},
			"Bilinç. Bir ay kılıcı nötr iyi yönelimli, 12 Zeka, 10 Akıl ve 12 Karizma skoruna sahip bilinçli bir silahtır. 120 fite kadar işitebilir ve gece görüşü vardır.",
			"Silah duyguları aktararak iletişime geçer, hissettiği bir şeyi aktarmak istediğinde onu kuşananın eline gıdıklayıcı bir his gönderir. Kullanıcı transta ya da uykudayken de görüler ve rüyalar ile daha açık bir şekilde iletişime geçebilir.",
			"Kişilik. Her ay kılıcı elf halkının ve elf ideallerinin yükselişini hedefler. Cesaret, sadakat, güzellik, müzik ve yaşam bu amacın parçalarıdır.",
			"Silah hizmet edeceği soya bağlıdır. Onun ideallerini paylaşan bir efendi ile bağ kurduğunda, sadakati sarsılmazdır.",
			"Eğer bir ay kılıcının kusuru varsa, bu aşırı özgüvendir. Bir efendiye karar verdiğinde, bu kişi elf ideallerine uygun olmasa bile sadece onun kendisini kullanabileceğine inanır."
		]
	},
	{
		"name": "Muhafız Kalkan",
		"type": "S",
		"weight": "6",
		"ac": 2,
		"tier": "Üst",
		"rarity": "Seyrek",
		"source": "DMG",
		"page": 199,
		"entries": [
			"Bu kalkanı tutarken öncelik ve Akıl ({@skill Algı}) zarlarında avantajın olur. Kalkanın üzerinde bir göz sembolü vardır."
		]
	},
	{
		"name": "Mermi Çekme Kalkanı",
		"type": "S",
		"weight": "6",
		"ac": 2,
		"tier": "Üst",
		"rarity": "Nadir",
		"source": "DMG",
		"page": 200,
		"reqAttune": "YES",
		"entries": [
			"Kalkanı tutarken menzilli silahlardan gelen hasara karşı direncin olur.",
			{
				"type": "entries",
				"name": "Lanet",
				"entries": [
					"Bu kalkan lanetlidir. Ona bağlanmak sen {@spell remove curse (lanet kaldır)} veya benzeri bir büyü ile hedef alınana kadar seni lanetler. Kalkanı bırakma üzerindeki laneti ortadan kaldırmaz. 10 fit yakınındaki bir varlığa menzilli silahla saldırı yapıldığında, lanet yüzünden bu saldırının hedefi sen olursun."
				]
			}
		]
	},
	{
		"name": "Büyü Koruma Kalkanı",
		"type": "S",
		"weight": "6",
		"ac": 2,
		"tier": "Üst",
		"rarity": "Çok Nadir",
		"source": "DMG",
		"page": 201,
		"reqAttune": "YES",
		"entries": [
			"Bu kalkanı tutarken büyüler ve diğer büyülü etkilere karşı kurtulma zarlarında avantajlı olursun ve sana yapılan büyülü saldırılar dezavantajlı olur."
		]
	},
	{
		"name": "Balık Yöneten Üç Dişli Mızrak",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "4",
		"dmg1": "1d6",
		"dmg2": "1d8",
		"dmgType": "P",
		"property": [
			"T",
			"V"
		],
		"range": "20/60",
		"tier": "Üst",
		"rarity": "Seyrek",
		"source": "DMG",
		"page": 209,
		"reqAttune": "YES",
		"entries": [
			"Bu üç dişli mızrak büyülü bir silahtır. 3 yükü vardır. Bunu taşırken eylemini kullanıp 1 yük harcayarak {@spell dominate beast (hayvana hükmet)} büyüsünü (kurtulma DC'si 15), özünde yüzme hızı olan bir hayvan üzerinde kullanabilirsin. Mızrak her şafakta 1d3 harcanmış yükü yeniler."
		]
	},
	{
		"name": "Dalga",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "4",
		"dmg1": "1d6",
		"dmg2": "1d8",
		"dmgType": "P",
		"property": [
			"T",
			"V"
		],
		"range": "20/60",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 218,
		"reqAttune": "Sınırlama: Deniz tanrılarına tapan bir varlık",
		"sentient": true,
		"entries": [
			"White Plume Dağındaki zindanlarda tutulan bu üç dişli mızrak, üzerine dalgalar, deniz kabukları ve su varlıkları işlenmiş harika bir silahtır. Bu silaha bağlanabilmek için bir deniz tanrısına tapınmak zorunda olsan da Dalga yeni müritleri de zevkle kabul eder.",
			"Bu büyülü silahla yaptığın saldırı ve hasar zarlarına +3 bonusun olur. Eğer bununla kritik bir darbe vurursan, hedef HP maksimumunun yarısı kadar fazladan nekrotik hasar alır.",
			"Silah ayrıca {@item balık yöneten Üç dişli mızrak} ve bir {@item uyarı silahı} görevi de görür. Onu tutarken {@item suda soluma başlığı} etkisini gösterir, ve kübün yanına basmak yerine sadece seçerek onu bir {@item güç kübü} olarak da kullanabilirsin.",
			"Bilinç. Dalga, nötr yönelimi, 14 Zeka, 10 Akıl ve 18 Karizma skoru olan bilinçli bir silahtır. 120 fite kadar işitebilir ve gece görüşü vardır.",
			"Silah kullanıcısı ile telepatik iletişime geçebilir ve Aquan dilini okur, anlar ve konuşur. Ayrıca su hayvanları ile sanki {@spell speak with animals (hayvanlarla konuş)} büyüsü etkisindeymiş gibi konuşabilir, telepati ile kullanıcıyı da iletişime dahil eder.",
			"Kişilik. Sıkıldığında, Dalga'nın denizci şarkılarından deniz tanrılarına adanmış ilahilere kadar mırıldanma huyu vardır.",
			"Dalga bağnazca ölümlüleri deniz tanrılarının tapınmasına yönlendirme ya da inançsızları ölüme gönderme arzusu vardır. Eğer kullanıcı silahın bu dünyadaki arzularını yerine getiremezse çatışmalar yaşanır.",
			"Mızrağın dövüldüğü yere, Thunderforge denen ıssız bir adaya, nostaljik bir bağı vardır. Bir deniz tanrısı, bir fırtına devi ailesini oraya hapsetmiştir ve devler de bu tanrıya adanmışlıklarından (ya da isyanları için) Dalga silahını yaratmışlardır.",
			"Dalga kendi doğası ve amacı hakkında gizli şüphelere sahiptir. Deniz tanrılarına ne kadar adanmış olsa da, Dalga belirli bir deniz tanrısının sonunu getirmek için yaratılmış olmaktan korkar. Bu kader Dalga'nın değiştirebileceği birşey olmayabilir."
		]
	},
	{
		"name": "Whelm",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "2",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "B",
		"property": [
			"T",
			"V"
		],
		"range": "20/60",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 218,
		"reqAttune": "Sınırlama: Cüce",
		"sentient": true,
		"entries": [
			"Whelm cüceler tarafından dövülmüş ve şimdi White Plume Dağlarının zindanlarında kaybolmuş güçlü bir savaş çekicidir.",
			"Bu büyülü silahla yaptığın saldırı ve hasar zarlarına +3 bonusun olur. Whelm ile ilk saldırı zarını attıktan sonraki şafakta, silaha bağlı olduğun sürece kalacak bir açıkhava korkusu başlar. Gün içinde gökyüzünü görebildiğin sürece tüm saldırı, kurtulma ve yetenek zarlarında dezavantajlı olursun.",
			"Fırlatma Silahı. Whelm'de fırlatma özelliği vardır, normal menzil 20 fit ve uzun menzili 60 fit olacak şekilde. Onunla yapacağın bir menzilli saldırı ile vurduğunda hedef fazladan 1d8 ezme hasarı alır, eğer bu hedef bir devse fazladan hasar 2d8 olur. Silahı her fırlatışında saldırı sonrası uçarak eline döner. Eğer boş bir elin yoksa, silah ayağının dibine iner.",
			"Şok Dalgası. Eylemini kullanıp Whelm ile yere bir darbe indirip bu noktadan çevreye bir şok dalgası gönderebilirsin. O noktanın 60 fit çevresindeki seçeceğin her varlık DC 15 Dayanıklılık zarı atar ya da 1 dakikalığına {@condition sersemleme} durumuna girer. Bir varlık her sırasının sonunda kurtulma zarını tekrarlayabilir, başarılı olursa üzerindeki etkiyi sonlandırır. Bir kere kullanıldığında, bu özellik sonraki şafağa kadar bir daha kullanılamaz.",
			"Doğaüstü Farkındalık. Silahı tutarken, sana 30 fit çevrendeki gizli geçitlerin yerini bildirir. Ayrıca, eylemini kullanıp silahtan {@spell detect evil and good (İyi ve kötüyü hisset)} ya da {@spell locate object (nesne bul)} büyüsünü yapabilirsin. Büyülerden birini yaptığında, bunu sonraki şafağa kadar bir daha silahtan kullanamazsın.",
			"Bilinç. Whelm kuralcı nötr yönelimli, 15 Zeka, 12 Akıl ve 15 Karizma skoruna sahip bilinçli bir silahtır. 120 fite kadar işitebilir ve gece görüşü vardır.",
			"Silah kullanıcısı ile telepatik bir şekilde iletişim kurabilir ve Cücece, Devce ve Goblince dillerini okur, anlar ve konuşur. Savaşta kullanıldığında Cücece savaş naraları atar.",
			"Kişilik. Whelm'in amacı tüm dev ve goblinleri katletmek ve cüceleri tüm düşmanlara karşı korumaktır. Eğer kullanıcısı goblin ve devleri yok edemezse veya cüceleri koruyamazsa çatışmalar çıkar. Whelm'in onu yaratan cüce klanına bağı vardır, onlara Dankil ya da Mightyhammer klanı denir. O klana dönme hasretiyle yanar. O cüceleri tehlikelerden korumak için herşeyi yapar. Çekiç ayrıca utanç verici bir sır da saklar. Asırlar önce, bir süre boyunca onu gururla Ctenmiir adında bir cüce kuşanmıştı. Ama Ctenmiir bir vampire dönüştürülmüştü. İradesi o kadar güçlüydü ki Whelm'i bile kendi kötü amaçlarına alet etmişti, kendi klanını bile öldürtmüştü."
		]
	},
	{
		"name": "Hız Palası",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d6",
		"dmgType": "S",
		"property": [
			"F",
			"L"
		],
		"tier": "Üst",
		"rarity": "Çok Nadir",
		"source": "DMG",
		"page": 199,
		"reqAttune": "YES",
		"entries": [
			"Bu büyülü silah ile saldırı ve hasar zarlarında +2 bonusun olur. Ayrıca, her sıranda onunla bonus eylem olarak da bir saldırı yapabilirsin."
		]
	},
	{
		"name": "Cevap Kılıcı (Cevapçı)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Düzensiz İyi Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"Cevapçı adlı Düzensiz İyi kılıcın kabzasında zümrüt vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (Küstah)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Düzensiz Kötü Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"Küstah adlı Düzensiz Kötü kılıcın kabzasında oltutaşı vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (Sonlandırıcı)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Düzenli Nötr Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"Sonlandırıcı adlı Düzenli Nötr kılıcın kabzasında ametist vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (Son Şaka)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Düzensiz Nötr Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"Son Şaka adlı Düzensiz Nötr kılıcın kabzasında turmalin vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (İspatçı)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Nötr İyi Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"İspatçı adlı Nötr İyi kılıcın kabzasında topaz vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (Yanıtçı)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Nötr Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"Yanıtçı adlı Nötr kılıcın kabzasında peridot vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (Mukabeleci)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Düzenli İyi Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"Mukabeleci adlı Düzenli İyi kılıcın kabzasında akuamarin vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (İnciten)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Düzenli Kötü Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"İnciten adlı Düzenli Kötü kılıcın kabzasında lal taşı vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Cevap Kılıcı (Susturan)",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"tier": "Üst",
		"rarity": "Efsanevi",
		"source": "DMG",
		"page": 206,
		"reqAttune": "Sınırlama: Nötr Kötü Varlık",
		"entries": [
			"Greyhawk evreninde bu kılıçlardan sadece 9 tane olduğu bilinir. Her biri efsanevi kılıç Fragarach gibi bezenmiştir, bu genellikle \"Son Söz\" diye çevrilir. Dokuz kılıcın her birinin kendi adı ve yönelimi vardır ve her biri kabzasında farklı bir cevher taşır.",
			"Susturan adlı Nötr Kötü kılıcın kabzasında spinel vardır.",
			"Bu kılıç ile yapılan saldırı ve hasar zarlarına +3 bonusun olur. Ayrıca, kılıcı tutarken reaksiyonunu kullanıp erişiminde olan ve sana hasar veren bir varlığa tek bir yakın dövüş saldırısı yapabilirsin. Saldırıda avantajın olur ve bu özel saldırı ile verilen hasar hedefin tüm bağışıklık ve direncini yok sayar."
		]
	},
	{
		"name": "Güneş Kılıcı",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"F",
			"V"
		],
		"tier": "Üst",
		"rarity": "Nadir",
		"source": "DMG",
		"page": 205,
		"reqAttune": "YES",
		"entries": [
			"Bu eşya bir uzun kılıç kabzasına benzer. Bu kabzayı tutarken, bonus eylem kullanıp saf ışıktan oluşan bir kılıcın ortaya çıkmasını sağlayabilirsin, ya da kılıcın ortadan kaybolmasını sağlayabilirsin. Kılıç ortadayken, bu büyülü uzun kılıcın beceri özelliği vardır. Eğer kısa kılıç veya uzun kılıç silahları ile uzmanlığın varsa, güneş kılıcı ile uzmanlığın var sayılır.",
			"Bu silahla yaptığın saldırı ve hasar zarlarına +2 bonusun olur ve kesme yerine radyant hasar verir. Bu silahla bir yaşayan ölüye vurduğunda, bu hedef fazladan 1d8 radyant hasar alır.",
			"Kılıcın ışıldayan kısmı 15 fit çevresine parlak, 15 fit ötesinde loş ışık saçar. Bu ışık güneş ışığıdır. Kılıç ortadayken, eylemini kullanıp bu ışığın çapını beşer fit düşürebilir ya da artırabilirsin, bunun maksimumu 30 fit, minimumu 10 fittir."
		]
	},
	{
		"name": "Kas'ın Kılıcı",
		"type": "M",
		"weaponCategory": "Askeri",
		"weight": "3",
		"dmg1": "1d8",
		"dmg2": "1d10",
		"dmgType": "S",
		"property": [
			"V"
		],
		"rarity": "Artefakt",
		"source": "DMG",
		"page": 226,
		"reqAttune": "YES",
		"sentient": true,
		"entries": [
			"Vecna'nın gücü arttığında, fena ve acımasız teğmeni Eli Kanlı Kas'ı koruması ve sağ kolu olarak atadı. Bu alçak adam danışmanı, savaş lordu ve suikastçisi oldu. Başarıları Vecna'nın taktirini ve peşinde bir ödülü kazandırdı: onu kuşanacak adam kadar kara ruhlu bir kılıç.",
			"Uzun bir süre Kas Vecna'ya sadık bir şekilde hizmet etti ama Kas'ın gücü artarken kibiri de arttı. Kılıcı onu Vecna'yı alt etmesi için tetikliyordu, onun yerine imparatorluğu ikisi yönetebilirlerdi. Bir efsane Vecna'nın sonunun Kas'ın ellerinden olduğunu söyler ama Vecna da bu isyankar teğmenin sonunu getirmiştir, geriye Kas'dan sadece kılıcı kalır. Bu şekilde dünya daha parlak bir yer haline gelmiştir.",
			"Kas'ın Kılıcı büyülü ve bilinçli bir uzun kılıçtır ve onunla yapılan saldırı ve hasar zarlarına +3 bonus verir. 19 veya 20 atarsa kritik vurur ve yaşayan ölülere 2d10 fazladan hasar verir.",
			"Eğer kılıç kabzasından çekilmesinden sonra 1 dkika içerisinde kana bulanmazsa, kuşananı DC 15 Karizma kurtulma zarı atar. Başarılı olursa, kuşanan 3d6 psişik hasar alır. Başarısız olursa, kuşanan kişi kılıç tarafından {@spell dominate monster (yaratığa hükmet)} büyüsü etkisindeymiş gibi ele geçirilir ve kılıç kana bulanmayı talep eder. Kılıcın talebi karşılandığında büyü etkisi sonlanır.",
			"Rastgele Özellikler. Kas'ın Kılıcının şu rastgele özellikleri vardır:",
			{
				"type": "list",
				"items": [
					"1 küçük yararlı özellik",
					"1 büyük yararlı özellik",
					"1 küçük zararlı özellik",
					"1 büyük zararlı özellik"
				]
			},
			"Kas'ın Ruhu. Kılıç üzerindeyken her savaşın başında öncelik zarına d10 eklersin. Ayrıca, kılıçla saldırı yaptığında, saldırı bonusunun bir kısmı ya da tümünü AC'ne transfer edebilirsin. Değişmiş bonus bir sonraki sıranın başına kadar kalır.",
			"Büyüler. Kılıç üzerindeyken, eylemini kullanıp kılıçtan şu büyülerden birini kullanabilirsin (kurtulma DC'si 18): {@spell call lightning (yıldırım Çağır)}, {@spell divine word (kutsal söz)} veya {@spell finger of death (Ölüm parmağı)}. Kılıçtan bir büyü kullandığında, sonraki şafağa kadar o büyüyü bir daha kullanamazsın.",
			"Bilinç. Kas'ın Kılıcı düzensiz kötü yönelimli, 15 Zeka, 13 Akıl ve 16 Karizma skoruna sahip bilinçli bir silahtır. 120 fite kadar işitebilir ve gece görüşü vardır.",
			"Silah kuşananı ile telepatik iletişime geçebilir ve Ortak dili de okur, anlar ve konuşabilir.",
			"Kişilik. Kılıcın amacı Vecna'nın sonunu getirmektir. Vecna'nın müritlerini öldürme, işlerini yok etme ve planlarını baltalama bu amaca hizmettir.",
			"Kas'ın Kılıcı, {@item Vecna'nın Gözü} ve {@item Vecna'nın Eli} ile yozlaşmış kişileri de yok etmek ister. Kılıcın bu artefaktlara olan takıntısı zamanla kuşananı için de bir saplantı olacaktır.",
			"Kılıcı Yok Etme. Hem {@item Vecna'nın Gözü} hem de {@item Vecna'nın Eli} artefaktlarına bağlı bir varlık bunların özelliği olan dileğini kullanıp Kas'ın Kılıcının yapılmamış olmasını dileyebilir. Varlık {@spell wish (dilek)} büyüsünü kullanıp kılıcın Karizma zarına karşılık Karizma zarı atar. Kılıç varlığın 30 fit yakınında olmalıdır, yoksa büyü başarısız olur. Eğer çekişmeyi kılıç kazanırsa, hiçbir şey olmaz ve {@spell wish (dilek)} büyüsü boşa gider. Eğer kılıç çekişmeyi kaybederse, yok olur."
		]
	}
];

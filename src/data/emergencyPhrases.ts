import { EmergencyPhrase } from '../types';

export const EMERGENCY_PHRASES: EmergencyPhrase[] = [
  {
    id: 'em-1',
    category: 'medical',
    urgency: 'critical',
    english: 'I need immediate medical help / doctor.',
    arabic: 'أحتاج إلى مساعدة طبية عاجلة / طبيب.',
    translations: {
      juba_arabic: {
        text: 'Ana awoz musaada ta hakim sarii-sarii.',
        phonetic: 'AH-nah ah-WOHZ moo-SAH-dah tah hah-KEEM sah-REE sah-REE',
        dialect: 'Central Equatorian'
      },
      dinka: {
        text: 'Ɣɛn kɔɔr akïm kɔr kɔ̈c nyin.',
        phonetic: 'YEN kor ah-KEEM kor koch NYIN',
        dialect: 'Rek'
      },
      nuer: {
        text: 'Ɣän göörä ŋäth mi bɛ̈ɛ̈r pial kɛ pɛth.',
        phonetic: 'YAN gur-ah NGATH mee beer pee-AHL keh PETH',
        dialect: 'Western Nuer'
      },
      bari: {
        text: 'Nan nyengga konye na hakim lio-lio.',
        phonetic: 'NAHN nyeng-gah KOHN-yeh nah hah-KEEM lee-oh LEE-oh',
        dialect: 'Bari proper'
      },
      zande: {
        text: 'Mi naida undo nga ga ngbanga mbiko kaza ni ba sa.',
        phonetic: 'MEE nah-EE-dah OON-doh ngah gah ngbah-NGAH mbee-KOH kah-ZAH',
        dialect: 'Yambio Standard'
      }
    },
    culturalNote: 'In urgent medical contexts, speak clearly and motion toward the affected person without delay.'
  },
  {
    id: 'em-2',
    category: 'medical',
    urgency: 'critical',
    english: 'Where is the nearest health clinic or hospital?',
    arabic: 'أين تقع أقرب عيادة صحية أو مستشفى؟',
    translations: {
      juba_arabic: {
        text: 'Klinik aw mustashfa gariib weyn?',
        phonetic: 'KLEE-neek ow moos-TASH-fah gah-REEB WEYN?',
        dialect: 'Central Equatorian'
      },
      dinka: {
        text: 'Pan akïm tɔ̈ thiɔ̈k ee tɔ̈ tɛnɔ?',
        phonetic: 'PAHN ah-KEEM taw thee-AWK ee taw ten-OH?',
        dialect: 'Agar'
      },
      nuer: {
        text: 'Tɛ̈ɛ̈th pan akïm mi thiaak nɛnɛ?',
        phonetic: 'TEHTH pahn ah-KEEM mee thee-AHK neh-NEH?',
        dialect: 'Lou'
      },
      bari: {
        text: 'Bayit na mukungun na deken a nyon?',
        phonetic: 'BAH-yeet nah moo-koong-OON nah deh-KEN ah NYOHN?',
        dialect: 'Bari proper'
      }
    }
  },
  {
    id: 'em-3',
    category: 'water_food',
    urgency: 'high',
    english: 'Where can we find clean drinking water?',
    arabic: 'أين يمكننا الحصول على ماء شرب نظيف؟',
    translations: {
      juba_arabic: {
        text: 'Moya nadhiif ta shurub ligo weyn?',
        phonetic: 'MOY-yah nah-DHEEF tah SHOO-roob LEE-goh WEYN?',
        dialect: 'Central Equatorian'
      },
      dinka: {
        text: 'Pïu ke dek ke path aayee yök tɛnɔ?',
        phonetic: 'PEE-oo keh DEK keh PAHTH ah-yee YOK ten-OH?',
        dialect: 'Padang'
      },
      nuer: {
        text: 'Pïw mäth tin gɔa yɔ̈k nɛnɛ?',
        phonetic: 'PEE-oo math teen GOH-ah yok neh-NEH?',
        dialect: 'Western Nuer'
      },
      bari: {
        text: 'Piyon na mukan ti yawa i tɛ kango?',
        phonetic: 'PEE-yohn nah moo-KAHN tee yah-WAH ee teh KAHNG-oh?',
        dialect: 'Bari proper'
      },
      zande: {
        text: 'I na gbia ime mbira rogo gini ba?',
        phonetic: 'EE nah GBYAH EE-meh mbee-RAH roh-goh GEE-nee BAH?',
        dialect: 'Yambio Standard'
      }
    }
  },
  {
    id: 'em-4',
    category: 'protection',
    urgency: 'critical',
    english: 'Is this area safe? We need protection.',
    arabic: 'هل هذه المنطقة آمنة؟ نحن بحاجة إلى حماية.',
    translations: {
      juba_arabic: {
        text: 'Makaan de fi aman? Ani awoz himaya.',
        phonetic: 'mah-KAHN deh fee ah-MAHN? AH-nee ah-WOHZ hee-MAH-yah.',
        dialect: 'Central Equatorian'
      },
      dinka: {
        text: 'Piny kënë ee pial? Ɣɔk aakɔɔr gël.',
        phonetic: 'PINY keh-NEH ee pee-AHL? YOK ah-kor GEL.',
        dialect: 'Bor'
      },
      nuer: {
        text: 'Kɛmɛ thilɛ kɛ kɛl? Kɔn göörkɔ gël.',
        phonetic: 'KEH-meh thee-LEH keh KEL? KOHN goor-KOH GEL.',
        dialect: 'Eastern Jikany'
      },
      bari: {
        text: 'Kune jur a par? Sawa nyengga jur.',
        phonetic: 'KOO-neh JOOR ah PAHR? SAH-wah nyeng-GAH JOOR.',
        dialect: 'Bari proper'
      }
    }
  },
  {
    id: 'em-5',
    category: 'lost_family',
    urgency: 'high',
    english: 'I have lost my children / family members.',
    arabic: 'لقد فقدت أطفالي / أفراد عائلتي.',
    translations: {
      juba_arabic: {
        text: 'Iyaal tayi ma ahal tayi wodi beid / gaay.',
        phonetic: 'ee-YAHL TAH-yee mah AH-hahl TAH-yee woh-DEE bay-EED.',
        dialect: 'Central Equatorian'
      },
      dinka: {
        text: 'Mïïthkiɛ̈ ke kɔc baai diɛ̈ aacï mɛ̈ɛ̈r.',
        phonetic: 'MEETH-kyeh keh KOCH BAH-ee dyeh ah-CHEE mehr.',
        dialect: 'Rek'
      },
      nuer: {
        text: 'Gätkä kɛ kɔc dä aacik maar.',
        phonetic: 'GAT-kah keh KOCH dah ah-CHEEK MAHR.',
        dialect: 'Lou'
      },
      bari: {
        text: 'Ngorot kany ko tito kany a muryo.',
        phonetic: 'NGOH-roht KAHN-yee koh TEE-toh KAHN-yee ah moor-YOH.',
        dialect: 'Bari proper'
      }
    }
  },
  {
    id: 'em-6',
    category: 'registration',
    urgency: 'standard',
    english: 'Where is the registration point for humanitarian assistance?',
    arabic: 'أين نقطة التسجيل للحصول على المساعدات الإنسانية؟',
    translations: {
      juba_arabic: {
        text: 'Makaan ta tasjil ta musaada weyn?',
        phonetic: 'mah-KAHN tah tas-JEEL tah moo-SAH-dah WEYN?',
        dialect: 'Central Equatorian'
      },
      dinka: {
        text: 'Tɛ̈n gɔ̈t rinku kɔc kony tɔ̈ tɛnɔ?',
        phonetic: 'TEN gawt reen-KOO koch KOHN-yee taw ten-OH?',
        dialect: 'Rek'
      },
      nuer: {
        text: 'Tɛ̈ kɔɔr gɔ̈rkɛ ciɔŋ kɛmɛ tɔ̈ nɛnɛ?',
        phonetic: 'TEH kor gorr-KEH chee-AWNG keh-MEH taw neh-NEH?',
        dialect: 'Western Nuer'
      }
    }
  }
];

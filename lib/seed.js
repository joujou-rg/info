import Category from "@/models/Category";
import Article from "@/models/Article";
import { makeSlug } from "@/lib/helpers";

export const INITIAL_CATEGORIES = [
  { name: "الهامة", order: 1 },
  { name: "أخبار المنسقين", order: 2 },
  { name: "أخبار المتمدرسين", order: 3 },
  { name: "أخبار هامة", order: 4 },
  { name: "وثائق عامة", order: 5 },
  { name: "إحياء الأيام الوطنية والأعياد", order: 6 },
  { name: "صب الراتب الشهري للأعوان", order: 7 },
];

export async function ensureSeedData() {
  const catCount = await Category.countDocuments();
  if (catCount === 0) {
    const docs = INITIAL_CATEGORIES.map((c) => ({
      name: c.name,
      slug: makeSlug(c.name),
      order: c.order,
      showInNav: true,
    }));
    await Category.insertMany(docs);
  }

  const articleCount = await Article.countDocuments();
  if (articleCount === 0) {
    const categories = await Category.find().sort({ order: 1 }).lean();
    const byName = Object.fromEntries(categories.map((c) => [c.name, c._id]));

    const fallbackId = categories[0]?._id;
    if (!fallbackId) return;

    const sampleArticles = [
      {
        title: "انطلاق الموسم الدراسي الجديد لأقسام محو الأمية وتعليم الكبار وسط إقبال واسع",
        summary:
          "أعلنت إدارة المدرسة عن انطلاق التسجيلات والدروس الرسمية للموسم الجديد مع توفير جميع الكتب والمستلزمات التربوية للمتمدرسين.",
        content: `انطلقت صباح اليوم فعاليات الموسم الدراسي الجديد لأقسام محو الأمية وتعليم الكبار عبر مختلف المراكز والملحقات التابعة للمدرسة، وسط حضور مميز للمتمدرسين والمنسقين التربويين.\n\nوأكدت الإدارة في كلمتها الافتتاحية أن البرنامج السنوي يهدف إلى تمكين الدارسين من مهارات القراءة والكتابة والحساب، بالإضافة إلى ورشات تطبيقية تعزز الاندماج الاجتماعي والمهني.\n\nكما تم توزيع الحقائب والكتب المدرسية المجانية على المسجلين الجدد، مع ضبط جداول التوقيت بما يراعي ظروف العمال وربات البيوت.`,
        category: byName["الهامة"] || fallbackId,
        author: "إدارة المدرسة",
        photos: ["/images/samples/news-1.svg", "/images/samples/news-2.svg"],
        isFeatured: true,
        isBreaking: true,
        isPublished: true,
      },
      {
        title: "اجتماع تنسيقي موسع للمنسقين التربويين لضبط الرزنامة الفصلية",
        summary:
          "عقد مدير المدرسة اجتماعاً مع المنسقين لمناقشة آليات المتابعة البيداغوجية وتوزيع الأفواج على المراكز.",
        content: `عقدت إدارة المدرسة اجتماعاً تنسيقياً ضم كافة المنسقين التربويين والمشرفين على الأقسام، حيث تم تقييم حصيلة الفصل المنصرم وضبط خطة العمل للفترة المقبلة.\n\nوتناول الاجتماع سبل تذليل الصعوبات الميدانية التي يواجهها الأعوان والمدرسون، والعمل على توحيد التقارير الدورية الخاصة بنسبة الحضور والتقدم البيداغوجي للمتمدرسين.`,
        category: byName["أخبار المنسقين"] || fallbackId,
        author: "مصلحة التنسيق",
        photos: ["/images/samples/news-2.svg"],
        isFeatured: true,
        isBreaking: false,
        isPublished: true,
      },
      {
        title: "إعلان هام بخصوص صب الراتب الشهري لأعوان ومنسقي محو الأمية",
        summary:
          "تُعلم المصالح الإدارية والمالية كافة الأعوان والمنسقين أنه تم الشروع في إجراءات صب المستحقات الشهرية.",
        content: `تُنهي المصلحة المالية إلى علم جميع الأعوان والمنسقين المتعاقدين أنه تم استكمال مراجعة قوائم الحضور وإرسال الحوالات الخاصة بالراتب الشهري.\n\nوسيتمكن المعنيون من سحب مستحقاتهم عبر الحسابات البريدية والبنكية بداية من نهاية الأسبوع الجاري، مع دعوة من لم يستكمل ملفه الإداري إلى التقرب من الأمانة العامة.`,
        category: byName["صب الراتب الشهري للأعوان"] || fallbackId,
        author: "المصلحة المالية",
        photos: ["/images/samples/news-3.svg"],
        isFeatured: true,
        isBreaking: true,
        isPublished: true,
      },
      {
        title: "تكريم المتمدرسين المتفوقين في المسابقة الثقافية للقراءة والكتابة",
        summary:
          "نظمت المدرسة حفلاً تكريمياً على شرف الدارسين الذين حققوا أعلى النتائج في اختبارات المستوى الثاني.",
        content: `شهدت قاعة المحاضرات بالمدرسة حفلاً بهيجاً لتكريم المتفوقين في مسابقة القراءة السليمة والإملاء، بحضور أولياء الأمور والمنسقين.\n\nوقد عبّر المتمدرسون عن فرحتهم الكبيرة بهذه المبادرة التي تشجعهم على مواصلة مسارهم التعليمي بثقة وإصرار.`,
        category: byName["أخبار المتمدرسين"] || fallbackId,
        author: "لجنة الأنشطة",
        photos: ["/images/samples/news-1.svg"],
        isFeatured: false,
        isBreaking: false,
        isPublished: true,
      },
      {
        title: "تحميل استمارة التسجيل الجديدة والوثائق الإدارية المطلوبة للموسم الحالي",
        summary:
          "تضع الإدارة تحت تصرف المنسقين والمتمدرسين حزمة الوثائق العامة المحدثة الخاصة بالتسجيل والشهادات.",
        content: `يمكن لجميع المنسقين والدارسين الاطلاع على قائمة الوثائق العامة المطلوبة لتكوين الملف الإداري والتسجيل في أقسام محو الأمية، وتشمل استمارة المعلومات، نسخة من بطاقة الهوية، وشهادة الإقامة.\n\nكما يتوفر دليل إجراءات منح شهادات إثبات المستوى لدى مكاتب الاستقبال.`,
        category: byName["وثائق عامة"] || fallbackId,
        author: "الأمانة العامة",
        photos: ["/images/samples/news-3.svg"],
        isFeatured: false,
        isBreaking: false,
        isPublished: true,
      },
      {
        title: "برنامج خاص لإحياء اليوم الوطني لمحو الأمية وتنظيم أبواب مفتوحة",
        summary:
          "سطرت المدرسة برنامجاً ثرياً يشمل معارض لمنتجات المتمدرسين وندوات توعوية بمناسبة اليوم الوطني.",
        content: `بمناسبة إحياء الأيام الوطنية والأعياد، أعدت المدرسة برنامجاً ثقافياً وتربوياً متكاملاً يتضمن أبواباً مفتوحة للتعريف بجهود محو الأمية، وعرض تجارب ناجحة لدارسين واصلوا تعليمهم بنجاح.\n\nالدعوة مفتوحة للجميع للمشاركة في هذه الفعاليات التي تحتضنها الساحة الرئيسية للمؤسسة.`,
        category: byName["إحياء الأيام الوطنية والأعياد"] || fallbackId,
        author: "النشاط الثقافي",
        photos: ["/images/samples/news-2.svg"],
        isFeatured: false,
        isBreaking: false,
        isPublished: true,
      },
    ];

    await Article.insertMany(sampleArticles);
  }
}

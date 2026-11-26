import mongoose from "mongoose";

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "عنوان الخبر مطلوب"],
      trim: true,
    },
    summary: {
      type: String,
      required: [true, "ملخص الخبر مطلوب"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "محتوى الخبر مطلوب"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "التصنيف مطلوب"],
    },
    author: {
      type: String,
      default: "إدارة المدرسة",
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

ArticleSchema.index({ title: "text", summary: "text", content: "text" });

export default mongoose.models.Article || mongoose.model("Article", ArticleSchema);

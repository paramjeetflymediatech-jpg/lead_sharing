// import { NextResponse } from "next/server";
// // import { connectToDatabase } from "@/lib/mongodb";
// import SubCategory from "@/models/SubCategory";
// import Category from "@/models/Category";

// export async function POST(req) {
//   try {
//     // await connectToDatabase();

//     const { name, categoryId } = await req.json();

//     // ✅ FIXED VALIDATION
//     if (!name || !categoryId) {
//       return NextResponse.json(
//         { message: "name & categoryId required" },
//         { status: 400 }
//       );
//     }

//     // ✅ CHECK CATEGORY EXISTS
//     const category = await Category.findById(categoryId);
//     if (!category) {
//       return NextResponse.json(
//         { message: "Category not found" },
//         { status: 404 }
//       );
//     }

//     const slug = name
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9]+/g, "-");

//     // ✅ PREVENT DUPLICATE
//     let subCategory = await SubCategory.findOne({
//       slug,
//       category: categoryId,
//     });

//     if (!subCategory) {
//       subCategory = await SubCategory.create({
//         name,
//         slug,
//         category: categoryId, // 👈 IMPORTANT
//       });
//     }

//     return NextResponse.json(subCategory, { status: 201 });
//   } catch (error) {
//     console.error("SUBCATEGORY ERROR:", error);
//     return NextResponse.json(
//       { message: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   // await connectToDatabase();

//   const subcategories = await SubCategory.find();
//   // .populate("category", "name slug")
//   //;

//   return NextResponse.json(subcategories);
// }




import { NextResponse } from "next/server";
import SubCategory from "@/models/SubCategory";

export async function POST(req) {
  try {
    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { message: "name & categoryId required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    let subCategory = await SubCategory.findOne({
      slug,
      category: categoryId,
    });

    if (!subCategory) {
      subCategory = await SubCategory.create({
        name,
        slug,
        category: categoryId,
      });
    }

    return NextResponse.json(subCategory, { status: 201 });
  } catch (error) {
    console.error("SUBCATEGORY ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// ✅ YE GET METHOD UPDATE KAREIN
export async function GET(req) {
  try {
    // URL se categoryId parameter nikalo
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    // Agar categoryId hai to filtered results bhejo
    if (categoryId) {
      const subcategories = await SubCategory.find({ 
        category: categoryId 
      });
      return NextResponse.json(subcategories);
    }

    // Warna sab subcategories bhejo
    const subcategories = await SubCategory.find();
    return NextResponse.json(subcategories);
    
  } catch (error) {
    console.error("SUBCATEGORY FETCH ERROR:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
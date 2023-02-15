import {
  answers,
  categories,
  chapters,
  exams,
  questions,
} from "@prisma/client";
import { Form, NavLink, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs, MetaFunction } from "@remix-run/server-runtime";
import { useState } from "react";
import { Pagination } from "~/components/Pagination";
import { SelectMenu } from "~/components/SelectMenu";
import { prisma } from "~/db.server";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "OAB na Medida - Questões Comentadas",
});

const ITEMS_PER_PAGE = 30;
export const loader = async ({ request }: LoaderArgs) => {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const category = url.searchParams.get("materia") || undefined;
  const chapter = url.searchParams.get("tema") || undefined;
  const exam = url.searchParams.get("exame") || undefined;
  const categories = await prisma.categories.findMany({
    where: { status: true, isCategory: true },
    orderBy: { index: "asc" },
  });

  const chapters = await prisma.chapters.findMany({
    where: { status: true, categories: { status: true, isCategory: true } },
  });

  const exams = await prisma.exams.findMany({
    where: { status: true, NOT: { name: "INÉDITA" } },
    orderBy: { name: "asc" },
  });

  const count = await prisma.questions.count({
    where: {
      examId: exam,
      chapterId: chapter,
      chapters: { categoryId: category },
    },
  });
  const questions = await prisma.questions.findMany({
    where: {
      examId: exam,
      chapterId: chapter,
      chapters: { categoryId: category },
    },
    skip: ITEMS_PER_PAGE * (page - 1),
    take: ITEMS_PER_PAGE,
    include: {
      exams: true,
      chapters: { include: { categories: true } },
      answers: true,
    },
    orderBy: [
      {
        chapters: { categories: { index: "asc" } },
      },
      { numberQuestion: "asc" },
    ],
  });

  return json({
    categories,
    exams,
    chapters,
    questions,
    count,
    page,
    category,
    chapter,
    exam,
  });
};

function returnAlphabetLetterByIndex(index: number): string {
  return (index + 10).toString(36).toLocaleUpperCase();
}
export default function QuestionsPage() {
  const {
    categories,
    exams,
    chapters,
    questions,
    count,
    page,
    category,
    chapter,
    exam,
  } = useLoaderData<typeof loader>();

  const [categoryId, setCategoryId] = useState(category);

  return (
    <div className="h-max w-screen bg-[#333c4a]">
      <div className="mx-auto max-w-7xl px-10 sm:px-6 lg:px-8">
        <header>
          <div className="flex flex-shrink-0 items-center px-4">
            <NavLink to="/">
              <img
                className="h-14 w-auto"
                src="logo.svg"
                alt="Logo OAB na Medida"
              />
            </NavLink>
          </div>
        </header>
        <main className="mt-5">
          <section>
            <h2 className="text-3xl font-bold text-white">
              Questões comentadas OAB/FGV
            </h2>
          </section>
          <section>
            <Form
              method="get"
              className="mt-5 flex flex-col items-start justify-between  md:flex-row md:items-center"
            >
              <SelectMenu
                name="materia"
                defaultValue={category}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Selecione a Matéria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </SelectMenu>
              <SelectMenu name="tema" defaultValue={chapter}>
                <option value="">Selecione o Tema</option>
                {chapters
                  .filter((chapter) =>
                    categoryId ? chapter.categoryId === categoryId : true
                  )
                  .map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.name}
                    </option>
                  ))}
              </SelectMenu>
              <SelectMenu name="exame" defaultValue={exam}>
                <option value="">Exame OAB</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </SelectMenu>
              <button
                className="rounded-3xl bg-[#ffbe0f] px-5 py-2 font-bold"
                type="submit"
              >
                FILTRAR
              </button>
            </Form>
          </section>

          <section>
            <p className="text-white">Foram encontradas {count} questões</p>

            {questions.map((question) => (
              <Question
                key={question.id}
                category={question.chapters.categories}
                chapter={question.chapters}
                exam={question.exams}
                question={question}
              />
            ))}

            <Pagination
              currentPage={page}
              registerPerPage={ITEMS_PER_PAGE}
              totalRegisters={count}
            />
          </section>
        </main>

        <footer className="bg-black text-center text-white">
          <p>Copyright © OAB na medida. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
}

type QuestionProps = {
  question: questions & { answers: answers[] };
  chapter: chapters;
  category: categories;
  exam: exams;
};
function Question({ category, exam, question, chapter }: QuestionProps) {
  const [hiddenComment, setHiddenComment] = useState(false);
  return (
    <div>
      <hr className="my-8 border-[#ffbe0f]" />
      <div className="flex flex-col items-center justify-start space-x-3 text-xl font-bold text-[#ffbe0f] md:flex-row">
        <span>{category.name.toLocaleUpperCase()}</span>

        <span>
          Questão:{" "}
          <span className="text-white">
            {("000" + question.numberQuestion).slice(-3)}
          </span>
        </span>
        <span>
          Prova: <span className="text-white">{exam.name}</span>
        </span>
        <span>{chapter.name.toLocaleUpperCase()}</span>
      </div>

      <div
        className="text-justify text-lg text-white"
        dangerouslySetInnerHTML={{ __html: question.question }}
      />

      <div className="mt-5 flex flex-col">
        {question.answers.map((answer, index) => (
          <div className="mb-5">
            <div key={answer.id} className="flex flex-row ">
              <input
                type="radio"
                name={answer.questionId}
                value={answer.id}
                className="mr-2"
              />
              <label className="flex flex-row items-center text-justify text-lg text-white">
                <strong className="mr-2 text-[#ffbe0f]">
                  {returnAlphabetLetterByIndex(index)}
                </strong>
                <div dangerouslySetInnerHTML={{ __html: answer.answer }} />
              </label>
            </div>
            <span className={`${hiddenComment ? "block" : "hidden"} `}>
              <span
                className={`${
                  answer.correct ? "text-green-500" : "text-red-500"
                }`}
              >
                Resposta {`${answer.correct ? "correta" : "errada"}`} :{" "}
                <span className="text-white">{answer.comment}</span>
              </span>
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-start space-x-4">
        <Form method="post">
          <button className="rounded-2xl bg-[#ffbe0f] px-4 py-1 font-bold text-[#333c4a]">
            Responder
          </button>
        </Form>

        <button
          className="rounded-2xl border border-[#ffbe0f] px-4 py-1 font-bold text-[#ffbe0f] hover:bg-[#ffbe0f] hover:text-[#333c4a]"
          onClick={() => setHiddenComment((value) => !value)}
        >
          Comentários do professor
        </button>
      </div>
    </div>
  );
}

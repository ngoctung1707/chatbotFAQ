from crawler.parser.news_parser import NewsParser
from crawler.parser.course_parser import CourseParser
from crawler.parser.solution_parser import SolutionParser
from crawler.parser.research_lab_parser import ResearchLabParser
from crawler.parser.static_parser import StaticParser


class ParserRouter:

    _parsers = {
        "news": NewsParser,
        "course": CourseParser,
        "solution": SolutionParser,
        "research_lab": ResearchLabParser,
        "static": StaticParser,
    }

    @classmethod
    def get_parser(cls, parser_name: str):
        parser_class = cls._parsers.get(parser_name)

        if parser_class is None:
            raise ValueError(f"Unknown parser: {parser_name}")

        return parser_class()
